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
  let watch = vm.$options.watch || {};
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
 * @param {*} handler  watch的值
 * @param {*} options 用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
  if (typeof handler === 'object') { // watch的处理函数是Object形式
    options = handler; // 只有这种形式下才有参数
    handler = handler.handler; // 取它的值
  }

  if (typeof handler === 'string') {
    handler = vm[handler]; // 将实例方法作为handler
  }
  return vm.$watch(exprOrFn, handler, options);
}


export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  }

  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    // 数据应该依赖这个watcher，数据变化立刻执行这个watcher
    let watcher = new Watcher(this, exprOrFn, cb, {...options, user: true});
    if(options.immediate) { // 如果是immediate，立即执行
      cb();
    }
  }
}