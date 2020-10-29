// const host = 'localhost:5000';
const host = 'dev.db.team';

// const uri = 'cell:ckgrb3ypg000lajet7jr44nvm:A1';
// const uri = 'cell:ckgrcqi97000lh0et9yjt1sa1:A1';

const uri = 'cell:ckgsqo2hk000m1det5k0wb32o:A1';
const dir = 'sample//';

import { NodeRuntime } from '../runtime.node';

const runtime = NodeRuntime({ host, uri, dir });
runtime.run({ pull: true });
