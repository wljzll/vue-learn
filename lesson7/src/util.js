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
      return  options[key] = child[key];
    }

  }

  return options;
}
