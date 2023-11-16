import Dep from "./observer/dep";
import { observe } from "./observer/index";
import Watcher from "./observer/watcher";
import { nextTick, proxy } from "./util";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }

  if (opts.methods) {
    initMethods(vm);
  }

  if (opts.data) {
    initData(vm);
  }

  if (opts.computed) {
    initComputed(vm);
  }

  if (opts.watch) {
    initWatch(vm);
  }
}

function InitProps() {}

function initMethods() {}

// 数据的初始化操作
function initData(vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === "function" ? data.call(vm) : data;
  for (const key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
}

// -------------------------------------------------------------- computed 开始 --------------------------------------------------------------------------------
function initComputed(vm) {

  // 拿到组件中定义的computed对象
  let computed = vm.$options.computed;

  // 稍后用来存放计算属性的watcher
  const watcher = (vm._computedWatchers = {});

  // 遍历computed
  for (let key in computed) {
    
    // 取出每一个computed; userDef有两种形式：1. 函数; 2.Object - {get:(), set()}
    const userDef = computed[key];

    // 是函数直接使用 不是函数获取Object的get函数 目的是将 getter包装成函数
    const getter = typeof userDef == "function" ? userDef : userDef.get;

    // 为每个computed各自创建一个watcher 默认不执行 并保存
    watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}

/**
 * @description 将computed的每个键都定义在Vue实例上 定义成响应式数据
 * @param {*} target Vue实例
 * @param {*} key computed的键
 * @param {*} userDef computed对应的get函数或者Object
 */
function defineComputed(target, key, userDef) {
  // 定义一个对象描述
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
  };

  // 包装一个包含get/set的对象，将这个对象用作定义响应式的Object
  if (typeof userDef == "function") {
    // computed是函数形式
    sharedPropertyDefinition.get = createComputedGetter(key); //
  } else {
    // computed是get/set形式
    sharedPropertyDefinition.get = createComputedGetter(userDef.get); // ?
    sharedPropertyDefinition.set = userDef.set;
  }
  // 把computed的key定义到vue实例上 this.key = {}
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

/**
 * @description 返回computed响应式对应的get函数
 * @param {*} key computed的键
 * @returns
 */
function createComputedGetter(key) {
  // 对computed的值取值时会触发这个getter
  return function () {
    const watcher = this._computedWatchers[key]; // 取出computed对应watcher
    if (watcher) {
      if (watcher.dirty) {
        // 执行computed对应的函数 让computed依赖的数据收集computed对应的watcher
        watcher.evaluate(); 
      }
      // computed对应的函数都执行完了还有watcher在Dep.target上说明这个watcher是渲染watcher
      if (Dep.target) {
        // 手动调用computed的watcher的depend方法 让computed依赖的数据的watcher去收集渲染watcher
        watcher.depend();
      }
      return watcher.value;
    }
  };
}
// ------------------------------------------------------ computed 结束 --------------------------------------------------------------------------------------

// ------------------------------------------------------- watch 开始 ----------------------------------------------------------------------------------------
function initWatch(vm) {
  let watch = vm.$options.watch; // 获取用户定义的watch
  // 遍历watch
  for (let key in watch) {
    // watch可能是函数/数组/对象/字符串
    const handler = watch[key]; 
    if (Array.isArray(handler)) {
      // 数组单独处理 数组的每一个回调函数都会创建一个watcher
      handler.forEach((handle) => createWatcher(vm, key, handle));
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

/**
 *
 * @param {*} vm vue实例
 * @param {*} exprOrFn watch对应的key
 * @param {*} handler  watch的值可能是函数 或者 {}
 * @param {*} options  用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
  if (typeof handler === "object") {
    // 如果是object watch:{a: {handler: () => {}}}
    options = handler;
    handler = handler.handler;
  }

  if (typeof handler === "string") {
    // 这种是将method作为handler
    handler = vm[handler]; // 将实例方法作为handler
  }
  // 到这里handler都被处理成了函数类型
  return vm.$watch(exprOrFn, handler, options);
}
// ------------------------------------------------------- watch 结束 ----------------------------------------------------------------------------------------


/**
 * @description 往Vue原型链上挂载$nextTick和$watch方法
 * @param {*} Vue Vue类
 */
export function stateMixin(Vue) {

  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  };

  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    // 数据应该依赖这个watcher，数据变化立刻执行这个watcher
    let watcher = new Watcher(this, exprOrFn, cb, { ...options, user: true });
    if (options.immediate) {
      // 如果是immediate，立即执行
      cb();
    }
  };
}

// -----------------  watcher的执行流程 ----------------------------------
// 1. initWatch()将用户定义的数组形式的watch(可能有四种形式) 遍历交给createWatcher()处理
// 2. 在createWatcher()中将watch的handler统一处理成函数形式
// 3. 调用vm.$watch(), 创建Watcher实例 new Watcher(this, exprOrFn, cb, {...options, user: true })
// 4. new Watcher(), 执行constructor():
//    this.exprOrFn = exprOrFn; 这是watch对应的键
//    this.cb = cb; 这是watch键对应的值
//    this.user = options.user 这是watch才有的属性
//    包装getter()函数, 函数的功能是分割watch的键, 对这个键取值
//    调用this.get()方法 => 会调用 this.getter()
//    getter()对watch的键取值，触发对应的值的get(), 收集watch对应的watcher
// 5. watcher依赖的值发生了变化, 触发set(), dep.notify()通知收集的依赖更新
//    dep.notify()执行watcher的update()
//    queueWatcher(this)批量执行watcher的run()
//    run()执行get(), 并且执行this.call()

// ----------------- computed的执行流程 -----------------------------------
// 1. initComputed(vm): 遍历用户定义的computed, 给每个computed创建一个watcher, 默认不执行, 并调用defineComputed(target, key, userDef)目的是将computed定义在Vue实例上
// 2. defineComputed(target, key, userDef)：调用Object.defineProperty()将每个computed定义成Vue实例上的响应式, 并调用createComputedGetter(key)给computed添加响应式get
