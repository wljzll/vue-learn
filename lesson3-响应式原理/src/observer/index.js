import {
    arrayMethod
} from "./array";
/**
 * data中的数组需要考虑的情况：
 * 1、数组中的项是Object
 * 2、往数组中添加Object
 */
class Observer {
    constructor(value) {
        // 判断一个对象是否被观测过看他有没有__ob__这个属性

        // 给当前被观测的数据添加 __ob__属性，值是类的实例本身 
        Object.defineProperty(value, '__ob__', {
            enumerable: false,
            configurable: false,
            value: this
        })

        if (Array.isArray(value)) { // value是数组
            // 改写此数组原型上的七个方法
            value.__proto__ = arrayMethod
            // 观测数组中的对象类型，对象变化也要做一些事情
            this.observeArray(value); // 调用observeArray()方法对value进行响应式处理
        } else { // value是对象
            // 使用defineProperty 重新定义属性
            this.walk(value); // 调用walk()方法对value进行处理
        }

    }
    observeArray(value) {
        // 遍历数组每一项 如果数组项是引用类型 深度遍历
        value.forEach(item => {
            // 观测数组中的对象类型
            observe(item);
        })
    }
    walk(data) {
        let keys = Object.keys(data)
        keys.forEach(key => {
            defineReactive(data, key, data[key]); // Vue.util.defineReactive
        })
    }
}

function defineReactive(data, key, value) {
    // 把value再交给observe处理
    observe(value)
    // 将key用defineProperty定义到data上
    Object.defineProperty(data, key, {
        get() {
            console.log('用户获取值了', data, key, value)
            return value;
        },
        set(newValue) {
            console.log('用户设置值了', data, key, value)
            if (newValue === value) return
            // 如果用户将值设置为对象
            observe(newValue);
            value = newValue;
        }
    })
}

/**
 * @description 对data进行响应式处理
 * @param {Object} data 
 * @returns Observer类的实例
 */
export function observe(data) {
    // 如果data不是Object或者为null时，无法处理
    if (typeof data !== 'object' || data == null) {
        return data;
    }
    // 如果已经是响应式 不再处理
    if (data.__ob__) {
        return data;
    }
    // 创建Observe实例并将数据对象传入
    return new Observer(data)
}