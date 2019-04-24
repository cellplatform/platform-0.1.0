// tslint:disable
import * as express from 'express';

const pkg = require('../package.json');
const server = express();

/**
 * Routes
 */
server.get('*', (req, res) => {
  count++;
  res.send({
    name: pkg.name,
    version: pkg.version,
    count,
  });
});
let count = 0;

/**
 * Start the server.
 */
const PORT = 8080;
server.listen(PORT, () => {
  console.log();
  console.log(`👋  http://localhost:${PORT}`);
  console.log(`   version: ${pkg.version}`);
  console.log();
});
