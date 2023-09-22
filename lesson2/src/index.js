import { initMixin } from "./init"

// 声明Vue构造函数
function Vue(options) {
   // 实例化Vue的时候先去调用_init方法
   this._init(options)
}

// 加载Vue文件的时候就会去执行这个代码 - 初始化
initMixin(Vue)

export default Vue
