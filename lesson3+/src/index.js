import { initMixin } from "./init"
function Vue(options) {
   this._init(options)
}

// 初始化
initMixin(Vue);
renderMixin(Vue); // 生成虚拟DOM
export default Vue
