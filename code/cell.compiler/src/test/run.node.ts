const host = 'dev.db.team';
// const uri = 'cell:ckgrb3ypg000lajet7jr44nvm:A1';
// const uri = 'cell:ckgrcqi97000lh0et9yjt1sa1:A1';
const uri = 'cell:ckgre656w000ll6ete4msdoyy:A1';
const dir = 'sample//';

import { NodeRuntime } from '../runtime.node';

NodeRuntime({ host, uri, dir }).run();
