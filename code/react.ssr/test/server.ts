import { server } from '../src';

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifest, secret: '1234' });
app.listen({ port: 3000 });
