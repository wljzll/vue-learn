let id = 0;
class Dep {
    constructor() {
        this.subs = [];
        this.id = id++;
    }
    // 调用watcher的addDep()方法 让对应的watcher实例记录dep实例
    depend() {
        Dep.target.addDep(this);
    }
    // watcher实例中调用 将watcher保存到当前dep实例上
    addSub(watcher) {
        this.subs.push(watcher);
    }
    // 遍历当前dep实例记录的所有watcher 调用watcher实例的update()方法
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}
Dep.target = null;
let stack = [];
export function pushTarget(watcher) {
    Dep.target = watcher; // 保留watcher
    stack.push(watcher); // 收集watcher
}
export function popTarget() {
    stack.pop(); // // 弹出最后一个watcher
    Dep.target = stack[stack.length - 1]; // Dep.target赋值上一个watcher
}

export default Dep;
// dep和watcher是多对多的关系
// dep是用来收集watcher的
// dep可以存多个watcher
// 一个watcher可以对应多个dep
// 一个dep可以对应多个watcher