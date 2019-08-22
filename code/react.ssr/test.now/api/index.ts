import { server } from '@platform/react.ssr';

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const cdn = 'https://platform.sfo2.cdn.digitaloceanspaces.com/modules/react.ssr';
const app = server.init({ manifest, cdn });
export default app.server;
