import { nextTick } from "../util";
import { popTarget, pushTarget } from "./dep";
let id = 0;
class Watcher {
    /**
     * 
     * @param {*} vm vue实例
     * @param {*} exprOrFn vm._update(vm._render()); 更新渲染真实节点
     * @param {*} cb 
     * @param {*} options 
     */
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options;
        this.id = id++; // watcher的唯一标识
        this.deps = []; // watcher记录有多少dep依赖它
        this.depsId = new Set();
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }
        this.get(); // 默认调用getter方法，也就是exprOrFn
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.depsId.has(id)) {
            // watcher记住dep
            this.deps.push(dep);
            this.depsId.add(id);
            // dep记住watcher
            dep.addSub(this);
        }
    }
    run() {
        this.get();
    }
    get() {
        pushTarget(this); // 添加这个watcher实例
        this.getter();
        popTarget();
    }
    update() {
        // 同一时间 可能前后多次触发update所以把要执行更新的watcher收集起来 去重后批量执行
        queueWatcher(this);
        // this.get();
    }
}


let queue = []; // 将需要批量更新的watcher存到一个队列中 稍后执行
let has = {};
let pending = false;

/**
 * 批量刷新watcher队列
 */
function flushSchedulerQueue() {
    // 遍历收集的watcher 先调用watcher的run执行完以后 再去执行updated生命周期函数
    queue.forEach(watcher => {watcher.run();watcher.cb();});
    // 清空这一次的收集
    queue = [];
    has = {};
    pending = false;
}

/**
 * 收集要更新的watcher 批量更新
 * @param {*} watcher watcher实例
 */
function queueWatcher(watcher) {
    // 拿到watcher实例的id
    const id = watcher.id;
    // 当前watcher未收集过
    if (has.id == null) {
        // 收集watcher
        queue.push(watcher);
        // 标识已收集
        has.id = true;
    }
    // 在这段时间内收集的watcher未执行完 不再重新执行 nextTick
    if (!pending) {
        // setTimeout(() => {
        //     queue.forEach(watcher => watcher.run());
        //     queue = [];
        //     has = {};
        //     pending = false;
        // }, 0);
        nextTick(flushSchedulerQueue);
        // pending置为true 在这一轮的watcher执行完之前不会触发多次执行
        pending = true;
    }
}
/**
 * 在数据劫持的时候 定义 defineProperty的时候，已经给每个属性都添加了dep
 * 1. 是想把这个渲染watcher 放到dep.target属性上
 * 2. 开始渲染时会取值，就会调用每个属性的get方法，需要让这个属性的dep储存当前的watcher
 * 3. 页面上所需要的属性都会将这个watcher存放在自己的dep中
 * 4. 等会属性更新了 就重新调用渲染逻辑 通知自己储存的watcher来更新
 */
export default Watcher