import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { stateMixin } from "./state";
import { renderMixin } from "./vdom/index";

function Vue(options) {
  /**
   * initMixin()方法会在Vue原型上添加_init()方法
   * _init()方法做了几件事:
   * 1) 将全局的options合并到自己身上
   * 2) 调用beforeCreate生命周期钩子
   * 3) initState(vm)初始化data/methods/props/watch/computed
   * 4) 调用ceated生命周期钩子
   * 5) 调用$mount方法 - 这个方法只有创建根实例时会调用,子组件是手动调用$mount()方法
   */
  this._init(options);
}

// 原型方法初始化
// 初始化 在Vue原型上添加 _init() 和 $mount()方法
initMixin(Vue);

// 在Vue原型上添加_update()方法
lifecycleMixin(Vue); // 混合生命周期 渲染

// 在Vue原型上添加 _render() _c() _v() _s()函数
renderMixin(Vue); // 生成虚拟DOM

// 在Vue原型上添加$nextTick()/$watch()方法
stateMixin(Vue);

// 静态方法 Vue.component/Vue.directive/Vue.extend/Vue.mixin
initGlobalApi(Vue);

export default Vue;
