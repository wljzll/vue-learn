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
    arrayMethod[method] = function (...args) {
        // 当调用数组劫持的这7个方法时，页面应该更新 这个时候我要知道数组对应哪个dep

        // this就是调用数组方法的data
        const result = oldArrayProtoMethod[method].apply(this, args);
        let inserted
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
        if (inserted) ob.observeArray(inserted)
        ob.dep.notify(); // 数组上的dep通知页面更新
        return result
    }
})

// let data = {
//     arr : []
// }
// Object.defineProperty(data, 'arr', {
//     get() {
//         console.log('对data上的arr取值了');
//         return JSON.parse(JSON.stringify(data.arr))
//     },
//     set(newvalue) {
//         console.log('对data上的arr赋值了');
//     }
// })

// let arr = data.arr;
// arr.push(1);
// console.log(arr);