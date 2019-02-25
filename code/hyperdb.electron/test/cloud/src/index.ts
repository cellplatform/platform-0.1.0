import { express, log } from './common';
import { router } from './routes';

const PORT = 3000;
const app = express().use(router);

/**
 * Start the server.
 */
app.listen(PORT, () => {
  const url = `http://localhost:${log.magenta(PORT)}`;
  log.info(`\nListening on ${log.cyan(url)}\n`);
});
