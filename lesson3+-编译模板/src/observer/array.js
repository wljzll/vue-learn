// 拿到数组原型上的方法
let oldArrayProtoMethod = Array.prototype;

// 继承数组方法 arrayMethod.__proto__ = oldArrayProtoMethod
export let arrayMethod = Object.create(oldArrayProtoMethod)

// 列举要劫持的数组的方法
let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
]

// 遍历要劫持的数组方法
methods.forEach(method => {
    // 重写
    arrayMethod[method] = function(...args) {
        console.log('数组方法被调用了')
        // this就是调用数组方法的data
        // 调用原生方法处理
        const result = oldArrayProtoMethod[method].apply(this, args);
        let inserted
        // Observe实例
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift': // 这两个方法都是追加，追加的类型可能是对象类型，应该在此进行劫持
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2); // arr.splice(0, 1, {a:1})
                break;
            default:
                break;
        }
        // 如果是往数组中插入数据 则可能需要重新劫持
        if (inserted) ob.observeArray(inserted)

        return result
    }
})