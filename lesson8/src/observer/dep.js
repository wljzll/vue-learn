let id = 0;
class Dep {
    constructor() {
        this.subs = [];
        this.id = id ++;
    }
    depend() {
        // 实现dep和watcher的双向记忆
        // this.subs.push(Dep.target);
        // 调用watcher实例的addDep()方法
        Dep.target.addDep(this);
    }
    // 将当前watcher实例添加到档期dep实例的subs属性中 这个方法是在watcher的addDep方法中调用的
    addSub(watcher) {
        this.subs.push(watcher);
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