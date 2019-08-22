import { server } from '@platform/react.ssr';

const manifestUrl = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const baseUrl = 'https://platform.sfo2.cdn.digitaloceanspaces.com/modules/react.ssr';
const secret = process.env.SECRET;
const app = server.init({ manifestUrl, baseUrl, secret });
export default app.server;
