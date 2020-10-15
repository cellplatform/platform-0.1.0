const PORT = 3000;
const HOST = 'http://localhost';

const CONFIG = {
  name: '',
  dir: undefined,
  mode: 'production',
  url: `${HOST}:${PORT}/`,
  target: ['web'],
  entry: {},
  rules: [],
};

export const DEFAULT = { PORT, HOST, CONFIG };
