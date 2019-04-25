import { express } from './common';

export const router = express.Router();
const pkg = require('../../../package.json');

/**
 * [GET] wildcard.
 */
router.get('*', (req, res) => {
  res.send({
    type: 'express (test)',
    module: pkg.name,
    version: pkg.version,
  });
});
