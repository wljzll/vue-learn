# Vue的初始化流程
  
  ## Vue不是一个MVVM框架，因为Vue可以操作DOM去更新视图，而MVVM思想是不能绕过数据去更新视图的，Vue只是借鉴MVVM的思想

  ## 数组原则上也是Object，通过observe方法也能监测到，为什么还要单独有处理？
    - 1、我们开发功能时，很少对数组索引进行操作，为了性能考虑不对数组索引进行拦截


  ## Vue执行流程
    - 1、加载Vue框架的时：
      `
      1) 先声明Vue类
      2) 初始化操作
        initMixin => 在原型链上添加_init和$mount方法 => _init方法里 initState(数据响应式处理)/执行$mount方法渲染dom

        lifecycleMixin

        renderMixin => 创建虚拟DOM
      ;在原型链上
      `