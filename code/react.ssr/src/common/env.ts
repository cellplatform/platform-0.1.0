import { fs } from './libs';
fs.env.load({
  dir: fs.resolve('.'),
  ancestor: true,
});
