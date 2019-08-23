const {parentPort, threadId} = require('worker_threads');
const reactServerRender = require('../render');
const App = require('../component/Elephant');
const fs = require('fs');
const path = require('path');

const log = ((filename) => {
  if (fs.existsSync(filename)) {
    fs.truncateSync(filename, 0);
  }
  const file = fs.createWriteStream(filename, {flags: 'a'});
  return data => file.write(data + '\n');
})(path.join(__dirname, 'worker.log'));

parentPort.on('message', ({uuid, index}) => {
  log(`[WORKER]RECEIVE ${index} ${threadId} ${uuid}`);
  const now = Date.now();
  const data = reactServerRender(App, {total: 10});
  parentPort.postMessage({
    uuid,
    data
  });
  log(`[WORKER]FEEDBACK ${index} ${threadId} ${uuid} ${Date.now() - now}`);
});

