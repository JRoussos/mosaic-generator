module.exports = class LoadingBar {
    constructor(length) {
        this.length = length
        this.bar = new Array(50).fill('_')
    }
    
    update(index) {
        this.bar[Math.floor((index/this.length)*50)] = '█'
        return process.stdout.write('|' + this.bar.join('') + '|' + Math.round((index/this.length)*100) + '%\r')
    }

    clear() {
        process.stdout.write('\r')
    }

}