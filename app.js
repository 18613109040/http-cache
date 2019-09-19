const Koa = require('koa');
const app = new Koa();
const fs = require('fs');
// const crypto = require('crypto')
let img = fs.readFileSync('./test.png');
let html = fs.readFileSync('./test.html');
let etag =  0 ; //crypto.getHashes()
app.use(async (ctx, next) => {
  switch (ctx.path) {
    case '/':
      ctx.set('Content-Type', 'text/html');
      ctx.set('Cache-Control', 'no-store');
      ctx.body = html;
      break;
    case '/img/nothing': // 不给任何与缓存相关的头, 任何情况下, 既不会被浏览器缓存, 也不会被代理服务缓存
      console.log('/img/nothing')
      ctx.set('Content-Type', 'image/png');
      ctx.body = img;
      break;
    case '/img/expiress':  //设置了expires, 表示资源到期时间
      console.log('/img/expiress')
      const d  = new Date(Date.now() + 5000);
      ctx.set('Content-Type', 'image/png');
      ctx.set('expires', d)
      ctx.body = img;
      break;
    case '/img/cache-control=max-age': // 设置max-age表示在浏览器最多缓存的时间
      console.log('/img/cache-control=max-age')  
      ctx.set('Content-Type', 'image/png');
      ctx.set('Cache-Control', 'max-age=10');
      ctx.body = img;
     break;
    case '/img/cache-control=no-cache': //设置了no-cache表明每次要使用缓存资源前需要向服务器确认
      console.log('/img/cache-control=no-cache')  
      ctx.set('Content-Type', 'image/png');
      ctx.set('Cache-Control', 'no-cache');
      ctx.body = img;
      break;
    case '/img/modified': // 协商缓存
      let stats = fs.statSync('./test.png');
      let mtimeMs = stats.mtimeMs; // 获取文件最后一次修改时间
      let If_Modified_Since = ctx.headers['if-modified-since'];
      let oldTime = 0;
      if(If_Modified_Since) {
          const If_Modified_Since_Date = new Date(If_Modified_Since);
          oldTime = If_Modified_Since_Date.getTime();
      }
      
      mtimeMs = Math.floor(mtimeMs / 1000) * 1000;    // 这种方式的精度是秒, 所以毫秒的部分忽略掉
      console.log('mtimeMs', mtimeMs);
      console.log('oldTime', oldTime);
      if(oldTime < mtimeMs) {
        ctx.set('Content-Type', 'image/png');
        ctx.set('Cache-Control', 'no-store');  
        ctx.set('Last-Modified',new Date(mtimeMs).toGMTString());
        ctx.body= img
      }else {
        ctx.status = 304;
        ctx.body =''
      } 
    case '/img/modified': // 协商缓存 可以修改 test.png 来观察
      let stats = fs.statSync('./test.png'); 
      let mtimeMs = stats.mtimeMs; // 获取文件最后一次修改时间
      let If_Modified_Since = ctx.headers['if-modified-since'];
      let oldTime = 0;
      if(If_Modified_Since) {
          const If_Modified_Since_Date = new Date(If_Modified_Since);
          oldTime = If_Modified_Since_Date.getTime();
      }
      
      mtimeMs = Math.floor(mtimeMs / 1000) * 1000;    // 这种方式的精度是秒, 所以毫秒的部分忽略掉
      console.log('mtimeMs', mtimeMs);
      console.log('oldTime', oldTime);
      if(oldTime < mtimeMs) {
        ctx.set('Content-Type', 'image/png'); 
        ctx.set('Last-Modified',new Date(mtimeMs).toGMTString());
        ctx.body= img
      }else {
        ctx.status = 304;
        ctx.body =''
      } 
    case '/img/modified-and-no-store': // 协商缓存和强制缓存同时存在，强制缓存优先
      let stats = fs.statSync('./test.png');
      let mtimeMs = stats.mtimeMs; // 获取文件最后一次修改时间
      let If_Modified_Since = ctx.headers['if-modified-since'];
      let oldTime = 0;
      if(If_Modified_Since) {
          const If_Modified_Since_Date = new Date(If_Modified_Since);
          oldTime = If_Modified_Since_Date.getTime();
      }
      
      mtimeMs = Math.floor(mtimeMs / 1000) * 1000;    // 这种方式的精度是秒, 所以毫秒的部分忽略掉
      console.log('mtimeMs', mtimeMs);
      console.log('oldTime', oldTime);
      if(oldTime < mtimeMs) {
        ctx.set('Content-Type', 'image/png');
        ctx.set('Cache-Control', 'no-store');  
        ctx.set('Last-Modified',new Date(mtimeMs).toGMTString());
        ctx.body= img
      }else {
        ctx.status = 304;
        ctx.body =''
      } 
    case '/img/etag':  // 协商缓存
      const If_None_Match = ctx.headers['if-none-match'];
      console.log('If_None_Match,',If_None_Match);
      if(If_None_Match != etag) {
        ctx.set('Content-Type', 'image/png');
        ctx.set('ETag', etag);
        ctx.body= img
      } else {
        ctx.status = 304;
        ctx.body =''
      }
      break;
    default:
      break;
  }
  await next()
})


app.listen(3000);