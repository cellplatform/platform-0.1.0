import { HttpClient } from '@platform/cell.client';

import '@platform/cell.service/pkg.deployment/lib/env.node';

/**
 * Run remote code.
 */
(async () => {
  const client = HttpClient.create(8080);

  const info = await client.info();

  console.log('info', info);

  // client.

  // const s = Server.create()
})();
