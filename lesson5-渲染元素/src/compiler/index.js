//  <div id="app"><div id="my">hello {{name}} <span>world</span></div></div>

import { generate } from "./generate";
import { parseHTML } from "./parse";

export function compileToFunctions(template) {
  // html模板 => render函数
  // ast语法树
  /**
   * 1、将html代码转化成AST抽象语法树 可以用AST抽象语法树来描述语言本身
   * 2、通过这棵树 重新生成代码
   */

  let ast = parseHTML(template);

  // 2、优化静态节点
  // console.log(ast, 'ast');

  // 3、通过这棵树，重新生成代码
  let code = generate(ast);
  /**
    function anonymous() {
      with(this){
        return _c('div',
            {id:"app",style:{"color":"red"},class:"test"}, 
            _v("hello"+_s(school)),
            _c('span',undefined, _v("world"))
          )
      }
    }
   */
  let render = `with(this){return ${code}}`; // 用with包裹 要执行代码，通过改变this指向 指定with中模板字符串中的作用域
  let renderFn = new Function(render); // 生成render函数
  return renderFn;
  
}
