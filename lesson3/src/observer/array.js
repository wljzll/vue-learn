// 拿到数组原型上的方法
let oldArrayProtoMethod = Array.prototype;

// 继承数组方法 arrayMethod.__proto__ = oldArrayProtoMethod
export let arrayMethod = Object.create(oldArrayProtoMethod)

let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
]

methods.forEach(method => {
    // 给arrayMethod这个Object添加七个方法
    arrayMethod[method] = function (...args) {
        console.log('数组方法被调用了')
        // 调用原生的数组方法 this就是调用数组方法的data
        const result = oldArrayProtoMethod[method].apply(this, args);
        let inserted;
        // ob是Observe实例
        let ob = this.__ob__;
        // 处理可能插入的新项
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
        if (inserted) ob.observeArray(inserted)

        return result
    }
})