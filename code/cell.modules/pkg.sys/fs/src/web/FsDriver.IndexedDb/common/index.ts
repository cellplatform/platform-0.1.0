import { Schema } from '../../common';

export * from '../../common';
export * from '../../IndexedDb';
export * from './Db.Lookup';
export * from './Image';

export const ROOT_DIR = '/';
export const NAME = {
  STORE: {
    PATHS: 'Paths',
    FILES: 'Files',
  },
  INDEX: {
    DIRS: 'DirIndex',
    HASH: 'HashIndex',
  },
};

export const LocalPath = Schema.File.Path.Local;
