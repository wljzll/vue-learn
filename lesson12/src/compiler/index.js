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
    
    // 将template通过字符串截取等操作转换成抽象语法树
    let ast = parseHTML(template);

    // 2、优化静态节点


    // 3、通过这棵树，重新生成代码 生成AST抽象语法树
    let code = generate(ast);

    // console.log(typeof ast.attrs[1].value, 'AST');
    let render = `with(this){return ${code}}`; // 用with包裹 要执行代码，通过改变this指向 指定with中模板字符串中的作用域
    let renderFn = new Function(render); // 生成render函数
    return renderFn;

}