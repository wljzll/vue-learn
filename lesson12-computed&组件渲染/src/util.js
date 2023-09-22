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


// ----------------------------------------- mergeHook -----------------------------------------------------
export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];
const strats = {};
strats.components = function (parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
};
// strats.data = function(parentVal, childVal) {
//         return childVal;
//     }
// strats.computed = function () {

// }
// strats.watch = function () {

// }

function mergeHook(parentVal, childVal) {
  if (childVal) {// 儿子有值
    if (parentVal) {
      return parentVal.concat(childVal); // 爸爸和儿子进行拼接
    } else {
      return [childVal]; // 儿子需要转换成数组
    }
  } else {
    // 儿子无值
    return parentVal; // 不合并了 直接采用父亲的
  }
}

LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});

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

  function mergeField(key) {
    // 合并字段
    // 根据key不同 进行策略合并 data created mounted ......
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      if (child[key]) {
        options[key] = child[key];
      } else {
        options[key] = parent[key];
      }
    }
  }

  return options;
}
// ----------------------------------------- mergeHook -----------------------------------------------------

// ----------------------------------------- nextTick ------------------------------------------------------

let callbacks = []; // 存放nextTick传入的cb
let pending = false; // 开关

function flushCallbacks() {
  while (callbacks.length) { // 一次执行callbacks
    let cb = callbacks.pop();
    cb();
  }
  pending = false; // 执行完成 打开开关
}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  let observe = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observe.observe(textNode, { characterData: true });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  }
}

export function nextTick(cb) {
  callbacks.push(cb); // 收集nextTick函数参数
  if (!pending) { // 在timerFunc执行完成前不再重新执行
    timerFunc();
    pending = true;
  }
}
// ---------------------------------------------  nextTick ----------------------------------------------


function makeMap(str) {
  const mapping = {};
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    mapping[list[i]] = true;
  }

  return (key) => {
    // 判断这个标签是不是原生标签
    return mapping[key];
  };
}
export const isReservedTag = makeMap(
  "a,div,img,p,span,ul,li,button,input,textarea"
);
