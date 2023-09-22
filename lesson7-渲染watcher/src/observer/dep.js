class Dep {

    constructor() {
        this.subs = [];
    }
    // dep实例收集watcher实例
    depend() {
        this.subs.push(Dep.target);
    }
    // 让dep实例收集到的watcher实例依次执行
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}
// 全局存放watcher实例
Dep.target = null;
export function pushTarget(watcher) {
    Dep.target = watcher; // 保留watcher
}
export function popTarget() {
    Dep.target = null;  // 将变量删除
}

export default Dep;
// dep和watcher是多对多的关系
// dep是用来收集watcher的
// dep可以存多个watcher
// 一个watcher可以对应多个dep
// 一个dep可以对应多个watcher