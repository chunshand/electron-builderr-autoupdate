
const Koa = require('koa')
const static = require('koa-static')
const range = require("koa-range")
const mount = require('koa-mount')
const path = require('path')
const app = new Koa()
console.log(path.join(__dirname, './release'));
app.use(range);
app.use(mount('/', static(path.join(__dirname, './release'), { defer: true })))
// app.use(async ctx => {
//     ctx.body = 'update serve';
// });

// 启动HTTP服务器监听请求
app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});

