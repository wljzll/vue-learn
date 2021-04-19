import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";

function Vue(options) {
   this._init(options)
}

// 原型方法初始化
initMixin(Vue);
lifecycleMixin(Vue); // 混合生命周期 渲染
renderMixin(Vue); // 生成虚拟DOM

// 静态方法 Vue.component/Vue.directive/Vue.extend/Vue.mixin
initGlobalApi(Vue);


export default Vue
