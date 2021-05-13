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
    } else {
      this.getter = function () {
        // 可能传递过来的是一个字符串
        // 只有去当前实例上取值时 才会触发依赖收集
        let path = exprOrFn.split("."); // ['a', 'a', 'a']
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]; // vm.a.a.a
        }
        return obj;
      };
    }
    // 获取的是老值 当是计算属性的watcher时，默认不执行，当是用户的$watch或渲染watcher时，默认执行
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
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
  get() {
    pushTarget(this); // 添加这个watcher实例
    let result = this.getter.call(this.vm);
    popTarget();
    return result;
  }
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this);
    }

    // this.get();
  }
  // 计算属性求值
  evaluate() {
    this.value = this.get();
    this.dirty = false; // 取过一次值后，就标识成已经取过值了
  }
  // computed的watcher调用，用来收集渲染watcher
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); // 让dep去储存渲染watcher
    }
  }
}
let queue = []; // 将需要批量更新的watcher存到一个队列中 稍后执行
let has = {};
let pending = false;

function flushSchedulerQueue() {
  queue.forEach((watcher) => {
    watcher.run();
    if (watcher.isWatcher) {
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
    queue.push(watcher);
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
}
/**
 * 在数据劫持的时候 定义 defineProperty的时候，已经给每个属性都添加了dep
 * 1. 是想把这个渲染watcher 放到dep.target属性上
 * 2. 开始渲染时会取值，就会调用每个属性的get方法，需要让这个属性的dep储存当前的watcher
 * 3. 页面上所需要的属性都会将这个watcher存放在自己的dep中
 * 4. 等会属性更新了 就重新调用渲染逻辑 通知自己储存的watcher来更新
 */
export default Watcher;
