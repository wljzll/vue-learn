import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom";

function Vue(options) {
   this._init(options)
}

// 初始化
initMixin(Vue);
lifecycleMixin(); // 混合生命周期 渲染
renderMixin();
export default Vue
