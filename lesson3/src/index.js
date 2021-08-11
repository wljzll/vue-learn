import { initMixin } from "./init"

function Vue(options) {
   // 当我们是使用Vue 去new Vue({})时 Vue原型上已经有了_init()方法
   this._init(options)
}

// 初始化 - 在Vue原型上添加 _init()方法
initMixin(Vue)

export default Vue
