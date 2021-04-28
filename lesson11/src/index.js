
import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle";
import { stateMixin } from "./state";
import { renderMixin } from "./vdom/index";

function Vue(options) {
   this._init(options)
}

// 原型方法初始化
initMixin(Vue);
lifecycleMixin(Vue); // 混合生命周期 渲染
renderMixin(Vue); // 生成虚拟DOM
stateMixin(Vue);

// 静态方法 Vue.component/Vue.directive/Vue.extend/Vue.mixin
initGlobalApi(Vue);

import { compileToFunctions } from "./compiler/index";
import { createElm, patch } from "./vdom/patch";
let vm1 = new Vue({
   data: { name: 'zf' }
})
let render1 = compileToFunctions(`
<div id="a" class="common">
  <li style="background:red;">A</li>
  <li style="background:yellow;">B</li>
  <li style="background:blue;">C</li>
  <li style="background:pink;">D</li>
</div>
`);
let vnode1 = render1.call(vm1);
document.body.appendChild(createElm(vnode1));


// 
let vm2 = new Vue({
   data: { name: 'px' }
})
let render2 = compileToFunctions(`
<div id="a" class="common">
<li style="background:green;">F</li>
<li style="background:yellow;">B</li>
<li style="background:blue;">C</li>
<li style="background:pink;">D</li>
<li style="background:purple;">D</li>
</div>
`);
let vnode2 = render2.call(vm2);
setTimeout(() => {
   patch(vnode1, vnode2);
}, 2000);

export default Vue
