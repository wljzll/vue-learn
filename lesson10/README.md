# watch的实现
  
   ### watch的几种形式
   > 1、直接是一个函数
    watch: {
        a(newValue, oldValue) {
        console.log(newValue, oldValue);
        },
    }

   > 2、key/value(value是一个object)
    watch: {
        a:{
            handler() {
                console.log('xxx')
            }
        }
    }

   > 3、key/value(value是数组形式)
    watch: {
        a: [
        (newValue, oldValue) => {
            console.log(newValue, oldValue);
        },
        (newValue, oldValue) => {
            console.log(newValue, oldValue);
        },
        ],
    }

   > 4、key/value(value是method中的方法)
    watch: {
        a:'aa', // aa 是method中的方法
    }