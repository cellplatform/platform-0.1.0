import Size from 'filesize';
import { FilesizeOptions } from './types';

/**
 * Convert a number of bytes into a human-readable string.
 */
export const Filesize = (bytes: number, options: FilesizeOptions = {}) => {
  return Size(bytes, options);
};
