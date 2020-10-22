import { fs } from './libs';

const CONFIG = {
  name: '',
  dir: 'dist',
  mode: 'production',
  port: 3000,
  target: ['web'],
  entry: {},
};

export const PATH = {
  cachedir: fs.resolve('./node_modules/.cache/cell.compiler'),
};

export const FILE = {
  JS: { REMOTE_ENTRY: 'remoteEntry.js' },
  HTML: { ENTRY: 'index.html' },
};

const BASE = 'base';
const WEBPACK = { rules: [], plugins: [] };
export const DEFAULT = { CONFIG, WEBPACK, BASE, FILE };
