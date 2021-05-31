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

function initComputed(vm) {
    let computed = vm.$options.computed;
    const watcher = (vm._computedWatchers = {}); // 稍后用来存放计算属性的watcher
    for (let key in computed) {
        const userDef = computed[key]; // 取出每一个computed
        const getter = typeof userDef == "function" ? userDef : userDef.get; // 这个getter是给watcher使用的
        watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true });
        defineComputed(vm, key, userDef);
    }
}

function defineComputed(target, key, userDef) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: () => {},
        set: () => {},
    };
    if (typeof userDef == "function") {
        sharedPropertyDefinition.get = createComputedGetter(key);
    } else {
        sharedPropertyDefinition.get = createComputedGetter(userDef.get);
        sharedPropertyDefinition.set = userDef.set;
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
    return function() {
        const watcher = this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate(); // 对当前watcher求值
            }
            if (Dep.target) { // 说明除了当前computed的watcher还有渲染watcher
                watcher.depend();
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