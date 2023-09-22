export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key];
    },
    set(newValue) {
      vm[data][key] = newValue;
    },
  });
}

export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    value,
  });
}

export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed"
];
const strats = {};
strats.data = function (parentVal, childVal) {
  return childVal;
}
strats.computed = function () {

}
strats.watch = function () {

}

function mergeHook(parentVal, childVal) {
  if (childVal) { // 儿子有值
    if (parentVal) {
      return parentVal.concat(childVal); // 爸爸和儿子进行拼接
    } else {
      return [childVal]; // 儿子需要转换成数组
    }
  } else { // 儿子无值 
    return parentVal;  // 不合并了 直接采用父亲的
  }
}
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
})

// 这个版本只考虑生命周期函数的合并
export function mergeOptions(parent, child) {
  // 遍历父亲，可能父亲有此属性 但儿子没有
  const options = {};

  // 父亲和儿子都有的属性在这里处理
  for (let key in parent) {
    mergeField(key);
  }

  // 儿子有父亲没有的属性 在这里处理
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) { // 合并字段
    // 根据key不同 进行策略合并 data created mounted ......
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      return options[key] = child[key];
    }

  }

  return options;
}


// 批量的回调函数
let callbacks = []; // 收集这一时段内调用nextTick去批量刷新的更新函数
let pending = false; // 是否执行flushCallbacks
// 将callbacks中的函数依次执行
function flushCallbacks() {
  // 只要数组还有元素
  while (callbacks.length) {
    // 拿出第一项
    let cb = callbacks.pop();
    // 执行
    cb();
  }
  // 所有的批量刷新函数都执行完了 可以开启下一轮
  pending = false;
}

// 能力检测
let timerFunc;
// 有Promise用Promise开启微任务
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  }
} else if (MutationObserver) { // 降级看有没有MutationObserver
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode, { characterData: true });
  timerFunc = () => {
    textNode.textContent = 2;
  }
} else if (setImmediate) { // 再降级看看有没有setimmediate
  setImmediate(flushCallbacks);
} else { // 降到最后 setTimeout肯定有
  setTimeout(flushCallbacks);
}

/**
 * @description 批量执行 回调函数参数
 * @param {*} cb 函数参数 收集的更新watcher集合或者用户传入的函数参数
 */
export function nextTick(cb) {
  // 收集要执行的回调函数
  callbacks.push(cb);
  // 收集到的callbacks执行完才会开启下一轮执行
  if (!pending) {
    timerFunc();
    pending = true; // 第一次收集后将pending置为true，不再调用timerFunc 只可能会继续收集 回调
  }

}
