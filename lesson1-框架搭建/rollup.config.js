import babel from '../lesson2/node_modules/rollup-plugin-babel';
import serve from '../lesson2/node_modules/rollup-plugin-serve';

export default {
    input: './src/index.js', // 入口文件
    output: {
        format: 'umd', // 模块化的类型
        name: 'Vue', // 全局变量的名字
        file: 'dist/umd/vue.js',
        sourcemap: true
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        serve({
            open: true,
            port: 3000,
            contentBase: '', // 根路径 ''表示项目根目录
            openPage: '/index.html', // 默认打开页面
        })
    ]
}