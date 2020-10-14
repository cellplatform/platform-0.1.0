import * as t from '../../common/types';

const PORT = 3000;
const HOST = 'http://localhost';
const CONFIG: t.WebpackModel = {
  name: '',
  mode: 'production',
  url: `${HOST}:${PORT}/`,
  target: ['web'],
};

export const DEFAULT = { PORT, HOST, CONFIG };
