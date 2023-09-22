import { observe } from "./observer/index";
import { proxy } from "./util";

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

function initComputed() {}
function initWatch() {}
