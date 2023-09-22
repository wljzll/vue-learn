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

function InitProps() { }
function initMethods() { }

// 数据的初始化操作
function initData(vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === "function" ? data.call(vm) : data;
  for (const key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
  console.log(data, '====================');
}

function initComputed() { }


// 处理 watch
function initWatch(vm) {
  // 获取用户声明的watch对象
  let watch = vm.$options.watch || {};
  // 遍历watch对象
  for (let key in watch) {
    const handler = watch[key]; // watch可能是函数/数组/对象/字符串
    if (Array.isArray(handler)) { // watch的handle是个数组
      // 遍历监听函数数组
      handler.forEach(handle => createWatcher(vm, key, handle))
    } else { // 函数/对象/字符串
      createWatcher(vm, key, handler)
    }
  }
}

/**
 * 
 * @param {*} vm Vue实例
 * @param {*} exprOrFn watch的键
 * @param {*} handler  watch的处理函数
 * @param {*} options 用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
  // watch的处理函数是Object形式
  if (typeof handler === 'object') {
    // 把handler赋值给options是为了取可能存在的dep,immeidate等字段
    options = handler;
    // 这个才是watch的响应函数
    handler = handler.handler;
  }
  
  // watch的处理函数是method上的方法
  if (typeof handler === 'string') {
    handler = vm[handler]; // 将实例方法作为handler
  }
  return vm.$watch(exprOrFn, handler, options);
}


export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  }
 
  /**
   * 
   * @param {*} exprOrFn 用户watch监听的数据字符串
   * @param {*} cb 数据变化后执行的处理函数
   * @param {*} options watch对应的值是对象的情况下 {handler, dep, immeidate,}
   */
  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    // 数据应该依赖这个watcher，数据变化立刻执行这个watcher
    let watcher = new Watcher(this, exprOrFn, cb, {...options, user: true});
    if(options.immediate) { // 如果是immediate，立即执行
      cb();
    }
  }
}