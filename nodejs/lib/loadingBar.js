module.exports = class LoadingBar {
    constructor(length) {
        this.length = length
        this.bar = new Array(50).fill('_')
    }
    
    update(index) {
        this.bar[Math.floor((index/this.length)*50)] = '█'
        process.stdout.write('|' + this.bar.join('') + '|' + Math.round((index/this.length)*100) + '%\r')
    }

    complete() {
        process.stdout.write('|' + this.bar.join('') + '|\x1b[32m[DONE]\x1b[0m\n\n')
    }

}