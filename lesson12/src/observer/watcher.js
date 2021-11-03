import { nextTick } from "../util";
import { popTarget, pushTarget } from "./dep";
let id = 0;
class Watcher {
  /**
   *
   * @param {*} vm vue实例
   * @param {*} exprOrFn 1) 渲染watcher是：vm._update(vm._render()),更新渲染真实节点; 2) 用户watcher是watch的键，是个字符串; 3) computed就是computed对应的取值函数
   * @param {*} cb 1) 渲染watcher是hooks; 2) 用户watcher是watch对应的处理函数; 3) computed就是个空函数
   * @param {*} options 1) 渲染watcher时一个布尔值; 2) 用户watcher主要是{user:true}; 3) computed的watcher是{lazy: true}
   */
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.options = options;
    this.user = options.user; // 标识这是一个用户watcher

    // computed用到的变量
    this.lazy = options.lazy; // 如果watcher上有lazy属性，说明是计算属性
    this.dirty = this.lazy; // dirty表示取值时是否执行是否执行用户提供的方法

    this.isWatcher = typeof options === "boolean"; // 标识是渲染watcher
    this.id = id++; // watcher的唯一标识
    this.deps = []; // watcher记录有多少dep依赖它
    this.depsId = new Set();
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } else { // 用户的watch选项
      this.getter = function () {
        // 可能传递过来的是一个字符串
        // 只有去当前实例上取值时 才会触发依赖收集
        let path = exprOrFn.split("."); // ['a', 'a', 'a']
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]; // vm.a.a.a // 用户watcher取值 触发get dep收集当前watcher
        }
        return obj;
      };
    }
    
    /**
     * 1) 渲染watcher和用户watcher会立即执行触发对应的数据收集这两个watcher
     * 2) computed的watcher不会立即执行，会在使用到时进行一次求值
     */
    this.value = this.lazy ? void 0 : this.get(); // 默认调用getter方法，也就是exprOrFn
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
    let newValue = this.get();
    let oldValue = this.value;
    if (this.user) { // 用户watcher
      // 用户watcher触发watcher对应函数的执行
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
  get() {
    pushTarget(this); // 将当前的watcher实例赋值给 Dep.target
    // getter有三种：
    // 1、渲染watcher: 执行渲染方法的函数；
    // 2、watch：对watch的键进行取值操作，触发响应式的get()收集当前的watcher；
    // 3、computed:computed对应的函数：会触发取值，从而触发响应式中的get()收集当前的watcher,所以computed依赖的属性都会收集computed new的这个watcher实例，当computed依赖的属性发生变化时，
    // 会执行这个watcher，执行getter()方法，getter方法就是computed的键对应的函数值，从而对computed重新求值
    // computed的watcher会被依赖的数据收集，从而在依赖的数据发生变化的时候触发重新求值
    let result = this.getter.call(this.vm); 
    popTarget();
    
    return result;
  }
  update() {
    // 如果是computed的watcher只是将dirty置为true
    if (this.lazy) {
      this.dirty = true;
    } else { // 渲染watcher和用户watcher执行对应的get方法
      queueWatcher(this);
    }

    // this.get();
  }
  // computed使用：计算属性求值 
  evaluate() {
    this.value = this.get();
    this.dirty = false; // 取过一次值后，就标识成已经取过值了
  }
  // computed使用：computed的watcher调用, 让computed依赖的数据去收集当前的渲染watcher, 实现一种特殊情况下的页面更新
  depend() {
    // 获取当前computed的watcher记忆的dep
    let i = this.deps.length;
    while (i--) {
      // 调用dep的depend()方法，
      this.deps[i].depend(); // 让dep去储存渲染watcher
    }
  }
}

// --------------------------------- queueWatcher ---------------------------------------
let queue = []; // 将需要批量更新的watcher存到一个队列中 稍后执行
let has = {};
let pending = false;
// 遍历收集的watcher 执行watcher的run()方法
function flushSchedulerQueue() {
  queue.forEach((watcher) => {
    watcher.run();
    if (watcher.isWatcher) { // 渲染watcher会有更新
      watcher.cb();
    }
  });
  // 还原状态
  queue = [];
  has = {};
  pending = false;
}

// 短时间内可能多次调用queueWatcher
function queueWatcher(watcher) {
  const id = watcher.id;
  if (has.id == null) { // 如果此前未收集过此watcher
    queue.push(watcher); // 添加到队列中
    has.id = true; // 标识已收集id对应的watcher
  }
  if (!pending) {
    nextTick(flushSchedulerQueue); // 在微任务里执行收集的watcher队列
    pending = true;
  }
}
// --------------------------------- queueWatcher ---------------------------------------
/**
 * 在数据劫持的时候 定义 defineProperty的时候，已经给每个属性都添加了dep
 * 1. 是想把这个渲染watcher 放到dep.target属性上
 * 2. 开始渲染时会取值，就会调用每个属性的get方法，需要让这个属性的dep储存当前的watcher
 * 3. 页面上所需要的属性都会将这个watcher存放在自己的dep中
 * 4. 等会属性更新了 就重新调用渲染逻辑 通知自己储存的watcher来更新
 */
export default Watcher;


/**
 * 1) 初始化computed,创建watcher - 这个watcher会执行computed对应的函数，会对data数据进行取值计算,这时对应的data就会收集computed这个watcher,
 *    当对应的data变化时就会触发这个computed的watcher,从而对这个computed重新求值。
 * 
 * 2) 当渲染页面时, 会先 new Watcher() - 渲染watcher，立即执行渲染watcher的get()方法，将当前watcher添加到stack栈中，
 * 在调用render()方法渲染页面时：
 * 使用到了computed => 触发computed的getter => getter中调用当前computed的watcher的evaluate()方法 => 调用watcher的get()方法 => 将当前watcher加入stack中(pushTarget)
 * => get()方法中对依赖的数据进行取值 => 触发对应数据的getter => 对应数据的dep先收集当前的computed的watcher => 执行完毕，从stack中弹出computed的watcher 
 * => 发现Dep.target上还有渲染watcher => 调用computed的watcher的depend方法，让这个watcher收集到的dep实例(收集了computed依赖的数据的dep)去收集这个渲染watcher，
 * 至此，computed依赖的数据把computed和渲染watcher都收集了，完成了整个computed的功能
 */

// 渲染watcher和用户watcher执行流程
// watcher.update() => queueWatcher() => flushSchedulerQueue() => run() => get()

// computed对应watcher的执行流程
// watcher.evaluate()