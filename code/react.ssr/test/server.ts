import { server } from '../src';

const app = server.init({ bundle: 'bundle' });
app.start();
