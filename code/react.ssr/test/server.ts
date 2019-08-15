import { server } from '../src';

const manifestUrl = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifest: manifestUrl, secret: '1234' });
app.listen();
