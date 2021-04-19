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
        this.dep = new Dep(); // 这里本意是给数组添加dep，但是同时Object也会添加一个，不过我们不用
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
    let childDep = observe(value)
    let dep = new Dep(); // 每个属性都有一个dep

    // 当页面取值时 说明这个值用来渲染了 这时将这个watcher和这个属性对应起来
    Object.defineProperty(data, key, {
        get() { // 依赖收集
            if (Dep.target) {  // 让这个属性记住这个watcher
                dep.depend();
                if(childDep) { // 这里其实Object也会走，但是没用
                    childDep.dep.depend(); // 目的是让数组存起来这个渲染watcher，但是Object也会有一个
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