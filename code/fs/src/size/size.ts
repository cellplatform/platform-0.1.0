import * as fsExtra from 'fs-extra';
import { glob } from '../glob';
import { resolve, join } from 'path';
import * as filesize from 'filesize';

export type IFileSize = {
  path: string;
  bytes: number;
  toString(options?: IFileSizeStringOptions): string;
};

export type IFolderSize = IFileSize & {
  files: IFileSize[];
};

export type IFileSizeStringOptions = {
  spacer?: string;
  round?: number;
};

/**
 * Helpers for working with sizes.
 */
export const size = {
  toString(bytes: number, options?: IFileSizeStringOptions) {
    return filesize(bytes, options);
  },

  /**
   * Calculates the size of a single file.
   */
  async file(path: string) {
    const bytes = (await fsExtra.lstat(path)).size;
    const size: IFileSize = {
      path,
      bytes,
      toString(options?: IFileSizeStringOptions) {
        return filesize(bytes, options);
      },
    };
    return size;
  },

  /**
   * Calculates the size of all files within a directory.
   */
  async dir(path: string) {
    const getFiles = async () => {
      const pattern = resolve(join(path), '**');
      const wait = (await glob.find(pattern)).map(async path => size.file(path));
      return Promise.all(wait);
    };
    const exists = await fsExtra.pathExists(path);
    const files = exists ? await getFiles() : [];
    const bytes = files.reduce((acc, next) => acc + next.bytes, 0);
    return {
      path,
      bytes,
      files,
      toString(options?: IFileSizeStringOptions) {
        return filesize(bytes, options);
      },
    };
  },
};
