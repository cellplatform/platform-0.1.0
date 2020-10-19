const PORT = 3000;
const HOST = 'http://localhost';

const CONFIG = {
  name: '',
  dir: undefined,
  mode: 'production',
  url: `${HOST}:${PORT}/`,
  target: ['web'],
  entry: {},
};

const WEBPACK = { rules: [], plugins: [] };
export const DEFAULT = { PORT, HOST, CONFIG, WEBPACK, BASE: 'base' };
