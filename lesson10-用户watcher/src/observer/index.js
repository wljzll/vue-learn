import { defineProperty } from "../util";
import { arrayMethod } from "./array";
import Dep from "./dep";
/**
 * data中的数组需要考虑的情况：
 * 1、数组中的项是Object
 * 2、往数组中添加Object
 */

// `data = {
//     arr: [],
//     obj: {},
//     get arr: f,
//     set arr: f
// }`


// data = {
//     arr: [],
//     obj: {
//         a: '',
//         b: {
            
//         }
//     }
// }

/**
 * 1) 在进行数据劫持时，首先传入的是根data，例如data = {arr: [], obj:{}}这种形式, 劫持的逻辑：
 *   1.1) 给当前实例添加个dep属性，属性值时Dep实例;
 *   1.2) 先给data上添加__ob__属性，属性值是当前的Observer实例;
 *   1.3) data是一个Object，交给walk()方法处理;
 *   1.4) 遍历data, 交给 defineReactive()方法处理arr和obj;
 *   1.5) defineReactive()方法调用observe(value)去处理arr和obj;
 * 
 * 2) observe(arr)(重新走1的逻辑):
 *   2.1) 给arr添加__ob__属性，属性值是当前的Observer实例;
 *   2.2) arr是数组，交给observeArray()方法处理;
 *   2.3) arr没有值，数组到这里完成;
 * 
 * 3) observe()方法处理完arr后，此时，observe(arr)返回的时observe实例，但是实例上有dep属性, 继续1中接下来的逻辑:
 *   3.1) new 一个Dep实例，对应到当前的arr上
 *   3.2) 将arr和obj这两个引用类型的值在data上定义成响应式的;
 *   3.3) get()方法中的逻辑：当取data上的arr时，会触发这个get()方法，当Dep.target上有watcher时，
 *   3.4) set()方法只有当data上的这个arr的引用地址改变时，才会触发set()，并不是arr里的值发生变化会触发set()执行;
 *   3.5) 所以新new的Dep实例和数组的内容改变无关，只有当这个数组的引用地址变了，才有用;
 */
class Observer {
    constructor(value) {
        // 在Observer实例上添加个dep实例 - 主要是为了数组的更新 - 下面需要考虑怎么让数组的这个dep去收集watcher
        this.dep = new Dep(); // 这里本意是给数组添加dep，但是同时Object也会添加一个，不过是给数组用的
        
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
    let childDep = observe(value);
    let dep = new Dep(); // 每个属性都有一个dep
    // 当页面取值时 说明这个值用来渲染了 这时将这个watcher和这个属性对应起来
    Object.defineProperty(data, key, {
        get() { // 依赖收集
            if (Dep.target) {  // 让这个属性记住这个watcher
                console.log('数组取值，收集依赖');
                dep.depend();
                if(childDep) { // Object和数组都会有childDep，但是下面的set函数并不会去使用Object的这个childDep去notify
                    console.log('数组取值，收集依赖2');
                    childDep.dep.depend(); // 目的是让数组存起来这个渲染watcher
                }
            }
            return value;
        },
        set(newValue) { // 依赖更新
            console.log('数组修改值，通知视图更新')
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


