import { fs } from '@platform/fs';

import { mergeLicences } from '../src/node/compiler.tasks/task.bundle.licences';
import { Logger } from '../src/node/common/util.logger';

const dir = fs.resolve('dist/web');

// mergeLicences({ dir });

Logger.bundle({ dir, elapsed: 1234 });
