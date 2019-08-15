import { server } from '../src';
import { MANIFEST, SECRET } from './constants';

const app = server.init({ manifest: MANIFEST, secret: SECRET });
app.listen({ port: 3000 });
