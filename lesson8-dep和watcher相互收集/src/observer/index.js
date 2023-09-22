import { defineProperty } from "../util";
import { arrayMethod } from "./array";
import Dep from "./dep";
/**
 * data中的数组需要考虑的情况：
 * 1、数组中的项是Object
 * 2、往数组中添加Object
 */
class Observer {
    constructor(value) {
        /**
         * 给Observer实例添加一个dep实例
         * 这里的dep实例是给数组用的 只不过对象上也会添加 但是没用
         */
        this.dep = new Dep();

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
    // 尝试对value进行代理
    let childDep = observe(value)
    // 创建dep实例
    let dep = new Dep();

    // 当页面取值时 说明这个值用来渲染了 这时将这个watcher和这个属性对应起来
    Object.defineProperty(data, key, {
        get() { // 依赖收集
            // 有激活的watcher
            if (Dep.target) {
                // dep实例收集激活的watcher
                dep.depend();
                // 如果儿子是数组或对象就会有childDep
                if(childDep) {
                    // 目的是让数组存起来这个渲染watcher，但是Object也会有一个 但是只有数组更新的时候notify才会触发执行
                    childDep.dep.depend();
                }
            }
            return value;
        },
        set(newValue) { // 依赖更新
            if (newValue === value) return
            // 如果用户将值设置为对象
            observe(newValue);
            value = newValue;
            dep.notify();
        }
    })
}


export function observe(data) {
    // 如果data不是Object或者为null时，无法处理
    if (typeof data !== 'object' || data == null) {
        return;
    }
    if (data.__ob__) {
        return data;
    }

    return new Observer(data)
}