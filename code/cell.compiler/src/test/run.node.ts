const host = 'dev.db.team';
// const uri = 'cell:ckgrb3ypg000lajet7jr44nvm:A1';
// const uri = 'cell:ckgrcqi97000lh0et9yjt1sa1:A1';
const uri = 'cell:ckgrrgta5000l1oet6dtc3l1s:A1';
const dir = 'sample//';

import { NodeRuntime } from '../runtime.node';

NodeRuntime({ host, uri, dir }).run({});
