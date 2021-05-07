let id = 0;
class Dep {
    constructor() {
        this.subs = [];
        this.id = id++;
    }
    depend() {
        // 实现dep和watcher的双向记忆
        // this.subs.push(Dep.target);
        Dep.target.addDep(this);
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
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
    stack.pop();
    Dep.target = stack[stack.length - 1]; // 将变量删除
}

export default Dep;
// dep和watcher是多对多的关系
// dep是用来收集watcher的
// dep可以存多个watcher
// 一个watcher可以对应多个dep
// 一个dep可以对应多个watcher