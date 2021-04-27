import { defineProperty } from "../util";
import { arrayMethod } from "./array";
/**
 * data中的数组需要考虑的情况：
 * 1、数组中的项是Object
 * 2、往数组中添加Object
 */
class Observer {
    constructor(value) {
        //  判断一个对象是否被观测过看他有没有__ob__这个属性
        defineProperty(value, '__ob__', this)
        if (Array.isArray(value)) {
            value.__proto__ = arrayMethod
                // 观测数组中的对象类型，对象变化也要做一些事情
            this.observeArray(value)
        } else {
            // 使用defineProperty 重新定义属性
            this.walk(value)
        }

    }
    observeArray(value) {
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
    // 如果值是一个对象
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            return value;
        },
        set(newValue) {
            if (newValue === value) return
                // 如果用户将值设置为对象
            observe(newValue);
            value = newValue;
        }
    })
}


export function observe(data) {
    // 如果data不是Object或者为null时，无法处理
    if (typeof data !== 'object' || data == null) {
        return data;
    }
    if (data.__ob__) {
        return data;
    }

    return new Observer(data)
}