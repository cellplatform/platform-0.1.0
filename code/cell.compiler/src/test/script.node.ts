const host = 'localhost:5000';
// const host = 'dev.db.team';

const uri = 'cell:ckgvq2g7s000m0oet81pi3rak:A1';
const dir = 'sample//'; // NB: Path will be cleaned.

import { NodeRuntime } from '@platform/cell.runtime/lib/runtime.node';

const runtime = NodeRuntime({ host, uri, dir });
runtime.run({});
