# vue-learn
 
  ## 初始化依赖
    `
    npm i rollup rollup-plugin-babel @babel/core @babel/preset-env rollup-plugin-serve -D
    `
    - rollup
    - rollup-plugin-babel 连接rollup和babel的插件
    - rollup-plugin-serve 起本地服务
 
  ## rollup配置文件 - rollup.config.js
    `
      "scripts": {
        "dev": "rollup -c -w"
      }
      -c 表示使用rollup.config.js配置文件
      -w 表示监测项目文件变化
    `