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



// -------------------------------------------------------------- computed 开始 --------------------------------------------------------------------------------
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
    let computed = vm.$options.computed; // 组件声明的computed
    const watcher = (vm._computedWatchers = {}); // 稍后用来存放计算属性的watcher
    for (let key in computed) { // 遍历computed
        const userDef = computed[key]; // 取出每一个computed; userDef有两种形式：1. 函数; 2.Object - {get:(), set()} 
        const getter = typeof userDef == "function" ? userDef : userDef.get; // 是函数直接使用 不是函数获取Object的get函数 目的是将 getter包装成函数
        // 将每个computed对应的watcher以键值对的形式保存
        watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true }); // 为当前computed创建一个watcher 默认不执行
        defineComputed(vm, key, userDef);
    }
}

/**
 * @description 将computed的每个键都定义在Vue实例上 定义成响应式数据
 * @param {*} target Vue实例 
 * @param {*} key computed的键
 * @param {*} userDef computed对应的get函数或者Object
 */
function defineComputed(target, key, userDef) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: () => {},
        set: () => {},
    };

    // 包装一个包含get/set的对象，将这个对象用作定义响应式的Object
    if (typeof userDef == "function") { // computed是函数形式
        sharedPropertyDefinition.get = createComputedGetter(key); // 
    } else { // computed是get/set形式
        sharedPropertyDefinition.get = createComputedGetter(userDef.get); // ?
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
        const watcher = this._computedWatchers[key]; // 取出computed对应watcher
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate(); // 对当前watcher求值 触发computed依赖的数据的get 从而让依赖数据的dep收集computed的watcher
            }
            if (Dep.target) { // computed的watcher执行完毕后 Dep.target还存在 说明除了当前computed的watcher还有渲染watcher
                /**
                 * computed有种情况是，computed依赖的属性没有在页面中使用到，在页面中只使用了computed，那么computed依赖的数据就不会去收集渲染watcher，只收集了computed对应的watcher
                 * 当computed依赖的数据发生变化时，只重新对computed进行了求值，但是并没有触发页面更新，所以我们需要让computed依赖的数据的dep收集对应的渲染watcher 
                 */
                watcher.depend(); // 目的是让computed依赖的数据去收集渲染watcher,computed变化一定是因为依赖的数据变化了，
            }
            return watcher.value;
        }
    };
}
// ------------------------------------------------------ computed 结束 --------------------------------------------------------------------------------------


// ------------------------------------------------------- watch 开始 ----------------------------------------------------------------------------------------
function initWatch(vm) {
    let watch = vm.$options.watch; // 获取用户定义的watch
    for (let key in watch) {
        const handler = watch[key]; // 每个watch watch可能是函数/数组/对象/字符串
        if (Array.isArray(handler)) { // 数组单独处理
            handler.forEach((handle) => createWatcher(vm, key, handle));
        } else {
            createWatcher(vm, key, handler);
        }
    }
}

/**
 *
 * @param {*} vm       vue实例
 * @param {*} exprOrFn watch对应的key
 * @param {*} handler  watch的值可能是函数 或者 {}
 * @param {*} options  用来标识是用户的watcher
 */
function createWatcher(vm, exprOrFn, handler, options) {
    if (typeof handler === "object") { // 如果是object watch:{a: {handler: () => {}}}
        options = handler;
        handler = handler.handler;
    }

    if (typeof handler === "string") { // 这种是将method作为handler
        handler = vm[handler]; // 将实例方法作为handler
    }
    // 到这里handler都被处理成了函数类型
    return vm.$watch(exprOrFn, handler, options);
}
// ------------------------------------------------------- watch 结束 ----------------------------------------------------------------------------------------

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


















// -----------------  watcher的执行流程 ----------------------------------
// 1. initWatch()将用户定义的数组形式的watch(可能有四种形式) 遍历交给createWatcher()处理
// 2. 在createWatcher()中将watch的handler统一处理成函数形式
// 3. 调用vm.$watch(), 创建Watcher实例 new Watcher(this, exprOrFn, cb, {...options, user: true })
// 4. new Watcher(), 执行constructor(): 
//    this.exprOrFn = exprOrFn; 这是watch对应的键
//    this.cb = cb; 这是watch键对应的值
//    this.user = options.user 这是watch才有的属性
//    包装getter()函数, 函数的功能是分割watch的键, 对这个键取值
//    调用this.get()方法 => 会调用 this.getter()
//    getter()对watch的键取值，触发对应的值的get(), 收集watch对应的watcher
// 5. watcher依赖的值发生了变化, 触发set(), dep.notify()通知收集的依赖更新
//    dep.notify()执行watcher的update()
//    queueWatcher(this)批量执行watcher的run()
//    run()执行get(), 并且执行this.call()

// ----------------- computed的执行流程 -----------------------------------
// 1. initComputed(vm): 遍历用户定义的computed, 给每个computed创建一个watcher, 默认不执行, 并调用defineComputed(target, key, userDef)目的是将computed定义在Vue实例上
// 2. defineComputed(target, key, userDef)：调用Object.defineProperty()将每个computed定义成Vue实例上的响应式, 并调用createComputedGetter(key)给computed添加响应式get