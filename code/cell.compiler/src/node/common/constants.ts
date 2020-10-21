const PORT = 3000;
const HOST = 'http://localhost';

const CONFIG = {
  name: '',
  dir: 'dist',
  mode: 'production',
  url: `${HOST}:${PORT}/`,
  target: ['web'],
  entry: {},
};

const BASE = 'base';
const WEBPACK = { rules: [], plugins: [] };
export const DEFAULT = { PORT, HOST, CONFIG, WEBPACK, BASE };
