import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import { streamToBuffer } from 'utils/data';

const plugins = {};

function initPlugin(id) {
  if (!plugins[id]) {
    plugins[id] = {};
  }
}

function getPluginId(file) {
  return path.parse(file).base;
}

function loadModule(id, data) {
  initPlugin(id);

  plugins[id].src = `data:text/javascript,${data}`;
}

function loadInfo(id, data) {
  initPlugin(id);

  plugins[id].info = JSON.parse(data);
}

function loadPluginFile(dir, file) {
  const id = getPluginId(dir);
  const filename = path.join(dir, file);

  if (!plugins[id]) {
    plugins[id] = {};
  }

  if (file === 'index.js') {
    const plugin = fs.readFileSync(filename, 'utf-8');
    loadModule(id, plugin);
  } else if (file === 'package.json') {
    const info = fs.readFileSync(filename, 'utf-8');
    loadInfo(id, info);
  }
}

async function loadZipFile(file) {
  return new Promise((resolve, reject) => {
    const id = getPluginId(file.replace('.zip', ''));

    yauzl.open(file, { lazyEntries: true }, (err, zip) => {
      if (err) {
        reject(err);
      }

      zip.readEntry();

      zip.on('entry', entry => {
        if (!/\/$/.test(entry.fileName)) {
          zip.openReadStream(entry, async (err, readStream) => {
            if (err) {
              reject(err);
            }
            readStream.on('end', () => {
              zip.readEntry();
            });

            const data = await streamToBuffer(readStream);

            if (entry.fileName === 'index.js') {
              loadModule(id, data.toString('utf-8'));
            } else if (entry.fileName === 'package.json') {
              loadInfo(id, data.toString('utf-8'));
            }
          });
        }
      });
      zip.on('end', resolve);
    });
  });
}

async function loadDirectory(dir) {
  const files = fs.readdirSync(dir);
  const promises = [];

  for (const file of files) {
    promises.push(loadPluginFile(dir, file));
  }

  await Promise.all(promises);
}

export async function loadPlugins(dir) {
  const files = fs.readdirSync(dir);
  const promises = [];

  for (const file of files) {
    const filename = path.join(dir, file);

    if (file.endsWith('.zip')) {
      promises.push(loadZipFile(filename));
    } else if (fs.statSync(filename).isDirectory()) {
      promises.push(loadDirectory(filename));
    }
  }

  await Promise.all(promises);

  return plugins;
}

export function getPlugins() {
  return plugins;
}
