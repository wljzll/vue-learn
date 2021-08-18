import Dep from "./observer/dep";
import { observe } from "./observer/index";
import Watcher from "./observer/watcher";
import { nextTick, proxy } from "./util";

export function initState(vm) {
    const opts = vm.$options;
    if (opts.props) {
        initProps(vm);
    }

    if (opts.methods) {
        initMethods(vm);
    }

    if (opts.data) {
        initData(vm);
    }

    if (opts.computed) {
        initComputed(vm);
    }

    if (opts.watch) {
        initWatch(vm);
    }
}

function InitProps() {}

function initMethods() {}

// 数据的初始化操作
function initData(vm) {
    let data = vm.$options.data;
    vm._data = data = typeof data === "function" ? data.call(vm) : data;
    for (const key in data) {
        proxy(vm, "_data", key);
    }
    observe(data);
}



/**
 * computed的初始化流程：
 * 1) 获取用户声明的computed，用户声明的computed可能是一个函数，也可能是一个Object(有get()/set()函数)；
 * 2) 在vm实例上定义_computedWatchers空对象，用来存放computed对应的watcher；
 * 3) 遍历computed这个对象，拿到用户声明的每一个computed；
 * 4) 如果拿到的computed是个函数，那么就直接赋值给getter，如果是Object(get()/set())形式，就将其中的get()函数赋值给getter；
 * 5) new Watcher()，为每个computed创建对应的watcher实例，并保存到_computedWatcher中；
 * 6) 调用defineComputed()方法，将每个computed都定义成vm实例的响应式数据；
 */
function initComputed(vm) {
    let computed = vm.$options.computed;
    const watcher = (vm._computedWatchers = {}); // 稍后用来存放计算属性的watcher
    for (let key in computed) {
        const userDef = computed[key]; // 取出每一个computed
        // userDef有两种形式：1. 函数; 2.Object - {get:(), set()} 
        const getter = typeof userDef == "function" ? userDef : userDef.get; // 是函数直接使用 不是函数获取Object的get函数 目的是将 getter包装成函数
        // 将每个computed对应的watcher以键值对的形式保存
        watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true }); // new Watcher 时会默认执行 上面包装的 getter 从而触发取值操作
        defineComputed(vm, key, userDef);
    }
}

/**
 * @description 将computed的每个键都定义在Vue实例上 定义成响应式数据
 * @param {*} target Vue实例 
 * @param {*} key computed的键
 * @param {*} userDef computed对应的值
 */
function defineComputed(target, key, userDef) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: () => {},
        set: () => {},
    };

    // 包装一个包含get/set的对象，将这个对象用作定义响应式的Object
    if (typeof userDef == "function") {
        sharedPropertyDefinition.get = createComputedGetter(key);
    } else {
        sharedPropertyDefinition.get = createComputedGetter(userDef.get);
        sharedPropertyDefinition.set = userDef.set;
    }
    // 将computed定义成vm实例上的响应式数据
    Object.defineProperty(target, key, sharedPropertyDefinition);
}

/**
 * @description 返回computed响应式对应的get函数
 * @param {*} key computed的键 
 * @returns 
 */
function createComputedGetter(key) {
    return function() {
        // 获取computed对应的watcher
        const watcher = this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate(); // 对当前watcher求值
            }
            if (Dep.target) { // 说明除了当前computed的watcher还有渲染watcher
                /**
                 * computed有种情况是，computed依赖的属性没有在页面中使用到，在页面中只使用了computed，那么computed依赖的数据就不会去收集渲染watcher，只收集了computed对应的watcher
                 * 当computed依赖的数据发生变化时，只重新对computed进行了求值，但是并没有触发页面更新，所以我们需要让computed收集对应的渲染watcher 
                 */
                watcher.depend(); // 目的是让computed依赖的数据去收集渲染watcher,computed变化一定是因为依赖的数据变化了，
            }
            return watcher.value;
        }
    };
}

function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key]; // 每个watch watch可能是函数/数组/对象/字符串
        if (Array.isArray(handler)) {
            handler.forEach((handle) => createWatcher(vm, key, handle));
        } else {
            createWatcher(vm, key, handler);
        }
    }
}

/**
 *
 * @param {*} vm
 * @param {*} exprOrFn
 * @param {*} handler
 * @param {*} options 用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
    if (typeof handler === "object") {
        options = handler;
        handler = handler.handler;
    }

    if (typeof handler === "string") {
        handler = vm[handler]; // 将实例方法作为handler
    }
    return vm.$watch(exprOrFn, handler, options);
}

export function stateMixin(Vue) {
    Vue.prototype.$nextTick = function(cb) {
        nextTick(cb);
    };

    Vue.prototype.$watch = function(exprOrFn, cb, options) {
        // 数据应该依赖这个watcher，数据变化立刻执行这个watcher
        let watcher = new Watcher(this, exprOrFn, cb, {...options, user: true });
        if (options.immediate) {
            // 如果是immediate，立即执行
            cb();
        }
    };
}