const PORT = 3000;
const HOST = 'http://localhost';

const CONFIG = {
  name: '',
  dir: undefined,
  entry: {},
  mode: 'production',
  url: `${HOST}:${PORT}/`,
  target: ['web'],
};

export const DEFAULT = { PORT, HOST, CONFIG };
