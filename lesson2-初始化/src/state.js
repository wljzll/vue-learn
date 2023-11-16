import { observe } from "./observer/index";

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
    // 从options上拿到data
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data;
    observe(data)
}

function initComputed() {}
function initWatch() {}
