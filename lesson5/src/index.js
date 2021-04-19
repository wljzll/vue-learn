import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";

function Vue(options) {
   this._init(options)
}

// 初始化
initMixin(Vue);
lifecycleMixin(Vue); // 混合生命周期 渲染
renderMixin(Vue); // 生成虚拟DOM
export default Vue
