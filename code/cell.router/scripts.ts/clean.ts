import { fs } from '@platform/fs';

const paths = ['tmp', 'dist'];
paths.map((path) => fs.resolve(path)).forEach((path) => fs.removeSync(path));
