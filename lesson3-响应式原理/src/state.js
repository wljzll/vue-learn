import {
  observe
} from "./observer/index";


/**
 * @description 初始化Vue的各配置项
 * @param {Object} vm Vue实例 
 */
export function initState(vm) {
  const opts = vm.$options;
  // 初始化props
  if (opts.props) {
    initProps(vm);
  }

  // 初始化methods
  if (opts.methods) {
    initMethods(vm);
  }

  // 初始化data
  if (opts.data) {
    initData(vm);
  }

  // 初始化computed
  if (opts.computed) {
    initComputed(vm);
  }

  // 初始化洼田崇
  if (opts.watch) {
    initWatch(vm);
  }
}

function InitProps() {}

function initMethods() {}

// 数据的初始化操作
function initData(vm) {
  // 获取用户传入的data配置项
  let data = vm.$options.data
  // data如果时函数就执行获取返回值
  vm._data = data = typeof data === 'function' ? data.call(vm) : data;
  // data添加响应式
  observe(data)
}

function initComputed() {}

function initWatch() {}