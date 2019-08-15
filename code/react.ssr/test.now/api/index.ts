import { server } from '@platform/react.ssr';

const manifestUrl = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifestUrl });

export default app.server;
