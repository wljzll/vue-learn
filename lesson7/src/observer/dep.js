class Dep {

    constructor() {
        this.subs = [];
    }
    // 将当前的watcher实例保存到当前dep实例的subs[]属性内
    depend() {
        this.subs.push(Dep.target);
    }
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}
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