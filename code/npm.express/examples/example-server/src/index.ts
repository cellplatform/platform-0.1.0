// tslint:disable
import * as express from 'express';

const pkg = require('../package.json');
const server = express();

/**
 * Demonstrate the env-vars are loaded from [.env] file via `docker-compose.yml`
 */
console.log('\nprocess.env.FOO:', process.env.FOO || '<not-found>');
console.log();

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
  console.log(`👋  host:    http://localhost:${PORT}`);
  console.log(`   name:    ${pkg.name}`);
  console.log(`   version: ${pkg.version}`);
  console.log();
});
