import { server } from '@platform/react.ssr';

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifest });
export default app.server;

import { fs } from '@platform/fs';

// const path = fs.join(__dirname, '../package.json');
// console.log('path', path);

// const dir = fs.resolve(fs.join(__dirname, '..'));
// const names = fs.readdirSync(dir);
// console.log('names', names);
