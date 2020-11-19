import { fs } from '@platform/fs';
import { NodeRuntime } from '@platform/cell.runtime/lib/runtime.node';
import { invoke } from '@platform/cell.runtime/lib/runtime.node/invoke';

const dir = fs.resolve('dist/node');
invoke({ dir });
