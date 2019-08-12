import { server } from '../src';

const manifestUrl = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifestUrl, apiSecret: '1234' });
app.start();
