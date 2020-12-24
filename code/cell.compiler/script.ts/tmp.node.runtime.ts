const host = 'localhost:5000';
// const host = 'dev.db.team';
const uri = 'cell:ckhon6cdk000o6hetdrtmd0dt:A1';
const dir = 'sample//'; // NB: Path will be cleaned.

import { NodeRuntime } from '@platform/cell.runtime.node';

const runtime = NodeRuntime.create();
const bundle = { host, uri, dir };

runtime.run(bundle, { pull: true });
