const {Worker} = require('worker_threads');
const path = require('path');
const Koa = require('koa');
const os = require('os');
const fs = require('fs');

const log = ((filename) => {
  if (fs.existsSync(filename)) {
    fs.truncateSync(filename, 0);
  }
  const file = fs.createWriteStream(filename, {flags: 'a'});
  return data => file.write(data + '\n');
})(path.join(__dirname, 'main.log'));

const createMultithreadRenderer = (total) => {
  const callbacks = new Map();
  const workers = new Array(total)
    .fill(0)
    .map(() => {
      const worker = new Worker(path.join(__dirname, './worker.js'));
      worker.addListener('message', handleRenderFinised);
      return worker;
    });

  function handleRenderFinised({uuid, data}) {
    callbacks.get(uuid)(data);
    callbacks.delete(uuid);
  }

  console.log(`${total} workers created`);

  function generateUUID() {
    return new Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
      .join('-');
  }


  return (index) => new Promise(resolve => {
    const worker = workers[Math.floor(Math.random() * total)];
    const uuid = generateUUID();
    const now = Date.now();
    callbacks.set(uuid, (data) => {
      resolve(data);
      log(`[MAIN]FINISH ${index} ${uuid} ${Date.now() - now}`);
    });
    log(`[MAIN]SEND ${index} ${uuid}`);
    worker.postMessage({uuid, begin: now, index});
  });
};

let index = 0;

const render = createMultithreadRenderer(os.cpus().length - 1);

const app = new Koa();
app.use(async (ctx) => {
  if (ctx.url !== '/') {
    ctx.status = 404;
    return;
  }
  ctx.index = ++index
  log(`[koa] ${index} request`);
  ctx.body = await render(index);
});
app.listen(8080);
