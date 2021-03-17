class Observer {
   constructor(value) {
      // 使用defineProperty 重新定义属性
      this.walk(value)
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
         console.log('用户获取值了', data, key, value)
         return value
      },
      set(newValue) {
         console.log('用户设置值了', data, key, value)
         if (newValue === value) return
         // 如果用户将值设置为对象
         observe(newValue)
         value = newValue
      }
   })
}


export function observe(data) {
   // 如果data不是Object或者为null时，无法处理
   if (typeof data !== 'object' || data == null) {
      return
   }

   return new Observer(data)
}