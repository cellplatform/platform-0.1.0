import * as t from './types';

const CONFIG: t.WebpackModel = {
  name: '',
  mode: 'production',
  port: 3000,
  host: 'http://localhost',
  target: ['web'],
};
export const DEFAULT = { CONFIG };
