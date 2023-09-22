import { popTarget, pushTarget } from "./dep";

class Watcher {
    /**
     * 
     * @param {*} vm vue实例
     * @param {*} exprOrFn vm._update(vm._render()); 更新渲染真实节点
     * @param {*} cb 一般是 beforeUpdate 生命周期函数的包装函数
     * @param {*} options 
     */
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm;
        this.exprOrFn = exprOrFn;
        // 更新后执行的回调函数
        this.cb = cb;
        this.options = options;
        this.id = id++; // watcher的唯一标识
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }
        // 默认调用getter方法，也就是exprOrFn
        this.get(); 
    }
    get() {
        // 让Dep收集这个watcher
        pushTarget(this);
        // 调用渲染方法 在渲染的过程中可能会对响应式数据取值 然后
        this.getter();
        // 收集完了就把Dep对象上的target删除
        popTarget();
    }
    // 执行get方法 重新执行渲染函数
    update() {
        this.get();
    }
}
/**
 * 在数据劫持的时候 定义 defineProperty的时候，已经给每个属性都添加了dep
 * 1. 是想把这个渲染watcher 放到dep.target属性上
 * 2. 开始渲染时会取值，就会调用每个属性的get方法，需要让这个属性的dep储存当前的watcher
 * 3. 页面上所需要的属性都会将这个watcher存放在自己的dep中
 * 4. 等会属性更新了 就重新调用渲染逻辑 通知自己储存的watcher来更新
 */

/**
 * 1. 数据劫持时每个属性都添加 dep = new Dep()
 * 2. 将render函数渲染成真实DOM之前，会将渲染方法包装成 updateComponent() 这个函数, 收集起来, 保存到watcher实例的getter属性上
 * 3. new Watcher时会立即执行getter方法
 *    3.1 首先将当前的watcher实例挂载到Dep的静态属性target上 pushTarget(this)
 *    3.2 执行渲染方法(this.getter())，渲染时会对数据取值，会触发数据的 getter方法，会将这个渲染watcher收集属性的dep实例的subs[]属性中
 *    3.3 页面渲染完成，所有相关属性都收集了这个watcher，从Dep.target上删除这个watcher popTarget()
 * 4. 当数据变化时，会执行数据的set方法, 调用 dep.notify()方法
 *    4.1 dep.notify()方法会遍历dep.subs, 然后会依次调用每个watcher的update方法
 *    4.2 watcher的update方法调用的是watcher的get方法，通知页面更新，更新过程中重新收集这些相关watcher
 */