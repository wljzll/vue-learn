import { nextTick } from "../util";
import { popTarget, pushTarget } from "./dep";
let id = 0;
class Watcher {
    /**
     * 
     * @param {*} vm vue实例
     * @param {*} exprOrFn 1) 渲染watcher是：vm._update(vm._render()); 更新渲染真实节点；2) 用户watcher是watch的键，是个字符串
     * @param {*} cb 1) 渲染watcher是hooks; 2) 用户watcher是watch对应的处理函数;
     * @param {*} options 
     */
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        this.cb = cb;
        this.options = options;
        this.user = options.user; // 标识这是一个用户watcher
        this.isWatcher = typeof options === 'boolean'; // 标识是渲染watcher
        this.id = id++; // watcher的唯一标识
        this.deps = []; // watcher记录有多少dep依赖它
        this.depsId = new Set();


        if (typeof exprOrFn === 'function') { // 渲染watcher
            this.getter = exprOrFn; // 数据更新时执行的函数
        } else { // 用户watcher
            this.getter = function () { // 可能传递过来的是一个字符串
                // 只有去当前实例上取值时 才会触发依赖收集
                let path = exprOrFn.split('.'); // ['a', 'a', 'a']
                let obj = vm;
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]]; // vm.a.a.a 将值赋给obj
                }
                return obj; // 返回的是当前新值

            }
        }
        // 获取的是老值
        this.value = this.get(); // 默认调用getter方法，也就是exprOrFn
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
        let newValue = this.get(); // 渲染watcher无返回值 用户watcher返回的是最新的数据
        let oldValue = this.value; // 老值 
        if(this.user) { // 用户watcher执行cb
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
    get() {
        pushTarget(this); // 将当前watcher赋值给Dep.target这个静态属性
        let result = this.getter(); // 1) 渲染watcher：渲染函数; 2) 用户watcher：对watch的键进行取值操作，触发依赖收集; 无论哪一个都会取值，触发dep收集watcher
        popTarget(); // 收集完成后 弹出当前watcher
        return result;
    }
    // 数据变化 执行watcher的update方法 更新
    update() {
        queueWatcher(this);
        // this.get();
    }
}
let queue = []; // 将需要批量更新的watcher存到一个队列中 稍后执行
let has = {};
let pending = false;

function flushSchedulerQueue() {
    queue.forEach(watcher => { 
        watcher.run(); // 
        if(watcher.isWatcher) { // 渲染watcher 用户watcher就不会再执行 cb 导致执行run方法时重复执行
            watcher.cb(); 
        }
       
    });
    queue = [];
    has = {};
    pending = false;
}
function queueWatcher(watcher) {
    const id = watcher.id;
    if (has.id == null) {
        queue.push(watcher)
        has.id = true;
    }
    if (!pending) {
        // setTimeout(() => {
        //     queue.forEach(watcher => watcher.run());
        //     queue = [];
        //     has = {};
        //     pending = false;
        // }, 0);
        nextTick(flushSchedulerQueue);
        pending = true;
    }
    console.log(watcher);
}
/**
 * 在数据劫持的时候 定义 defineProperty的时候，已经给每个属性都添加了dep
 * 1. 是想把这个渲染watcher 放到dep.target属性上
 * 2. 开始渲染时会取值，就会调用每个属性的get方法，需要让这个属性的dep储存当前的watcher
 * 3. 页面上所需要的属性都会将这个watcher存放在自己的dep中
 * 4. 等会属性更新了 就重新调用渲染逻辑 通知自己储存的watcher来更新
 */
export default Watcher