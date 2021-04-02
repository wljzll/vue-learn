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
  console.log(ast);

  // 3、通过这棵树，重新生成代码
  let code = generate(ast);

  
}
