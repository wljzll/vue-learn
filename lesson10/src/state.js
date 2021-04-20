import { observe } from "./observer/index";
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
}

function initComputed() { }

function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // 每个watch watch可能是函数/数组/对象/字符串
    if (Array.isArray(handler)) {
      handler.forEach(handle => createWatcher(vm, key, handle))
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

/**
 * 
 * @param {*} vm 
 * @param {*} exprOrFn 
 * @param {*} handler 
 * @param {*} options 用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
  if (typeof handler === 'object') {
    options = handler;
    handler = handler.handler;
  }

  if (typeof handler === 'string') {
    hanlder = vm[handler]; // 将实例方法作为handler
  }
  return vm.$watch(exprOrFn, hanlder, options);
}
export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  }
}