import {
   initMixin
} from "./init"

function Vue(options) {
   this._init(options)
}

// 初始化
initMixin(Vue);
export default Vue