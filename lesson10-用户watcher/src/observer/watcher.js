import {
    nextTick
} from "../util";
import {
    popTarget,
    pushTarget
} from "./dep";
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
            // getter被包装成对watch的键进行取值的函数 从而触发依赖的收集
            this.getter = function () { // 可能传递过来的是一个字符串
                // 只有去当前实例上取值时 才会触发依赖收集
                let path = exprOrFn.split('.'); // ['a', 'a', 'a']
                let obj = vm;
                // 这里取值会触发依赖收集
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]]; // vm.a.a.a 将值赋给obj
                }
                return obj; // 返回的是当前新值

            }
        }
        // 获取的是老值
        this.value = this.get(); // 默认调用getter方法，也就是exprOrFn
    }
    // 收集dep dep实例的depend方法调用
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
        if (this.user) { // 用户watcher执行cb
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
        if (watcher.isWatcher) { // 渲染watcher 用户watcher就不会再执行 cb 导致执行run方法时重复执行
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

/**
 * Dep和watcher的工作流程：
 * 
 * 渲染watcher：
 *   1. 当渲染页面时, 先new Watcher()实例, new Watcher()时的核心：
 *     1.1) 调用自己的get()方法，get()方法做了三件事：
 *        1.1.1) pushTarget(this) - 将当前这个渲染watcher保存到Dep.target这个静态属性上;
 *        1.1.2) let result = this.getter() - 执行传入的渲染函数，渲染页面时会取值，触发响应式数据的getter()方法，去收集这个渲染watcher;
 *        1.1.3) popTarget() - 将当前渲染watcher从Dep.target上删除  
 * 
 * 
 *   2. observe数据的时候，每个值都会对应一个Dep实例，并且在这个data的get和set函数中做对应的处理
 *    1.1) get()方法执行时, 会调用对应的Dep实例的depend()方法 - depend()方法，会获取到Dep.target上当前的watcher实例,让watcher实例调用自己的addDep()方法
 *         addDep方法: 将当前dep实例添加到自己的deps属性中，并且调用dep的addSub方法，
 *         addSub方法: 将当前watcher添加到自己的subs属性中
 *         从而实现了dep和watcher的双向记忆
 *    1.2) set()方法执行时，会调用对应的dep的notify()方法;
 *         notify方法: 将这个dep实例subs属性中的watcher拿出来，依次调用它的update方法;
 *         update方法: 收集一段时间内要执行的watcher, 批量执行这些watcher;
 * 
 * 用户watcher：
 *    1. 初始化用户的watch - new Watcher()
 *    2. new Watcher时,将用户watcher传入的watch的键包装成getter函数 - getter函数是对watch的键进行取值，
 *       从而触发对应的get()收集这个用户watcher
 *    3. 后面就是依赖的收集，和数据变化时的notify()通知
 */