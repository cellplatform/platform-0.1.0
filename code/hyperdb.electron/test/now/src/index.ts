import { express, log } from './common';

const app = express();

app.get('*', (req, res) => {
  res.send({ foo: 123 });
});

/**
 * Start the server.
 */
const PORT = 3000;
app.listen(PORT, () => {
  const url = `http://localhost:${log.magenta(PORT)}`;
  log.info(`\nListening on ${log.cyan(url)}\n`);
});
