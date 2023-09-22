let id = 0;
class Dep {
    constructor() {
        this.subs = [];
        this.id = id ++;
    }
    // 让每个dep实例都去收集当前在Dep.target上的watcher实例
    depend() {
        // 调用watcher的addDep方法把dep实例传入
        Dep.target.addDep(this);
    }
    // watcher实例去调用dep的addSub方法
    addSub(watcher) {
        this.subs.push(watcher);
    }
    // 通知dep实例收集的watcher重新渲染执行
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