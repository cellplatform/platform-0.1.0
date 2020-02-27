import * as archiver from 'archiver';
import * as fs from 'fs-extra';
import * as fsPath from 'path';

export type IZipperArgs = {
  level: number;
  format: 'zip' | 'tar';
  onProgress?: (e: IZipProgress) => void;
};

export type IZipResponse = {
  bytes: number;
};

export type IZipProgress = {
  isComplete: boolean;
  percent: number;
  total: number;
  processed: number;
  bytes: {
    total: number;
    processed: number;
  };
};

/**
 * Creates a zip archiver.
 */
export function zip(source: string, dest?: string) {
  return new Zipper().add(source, dest);
}

export class Zipper {
  /**
   * [Fields]
   */
  private items: { source: string; dest?: string }[] = [];

  /**
   * [Methods]
   */
  public add(source: string, target?: string) {
    this.items = [...this.items, { source, dest: target }];
    return this;
  }

  public async save(path: string, options: Partial<IZipperArgs> = {}) {
    return new Promise<IZipResponse>(async (resolve, reject) => {
      const { level = 9, format = 'zip', onProgress } = options;
      const archive = archiver(format, { zlib: { level } });

      await fs.ensureDir(fsPath.dirname(fsPath.resolve(path)));
      const output = fs.createWriteStream(fsPath.resolve(path));

      // Setup stream events.
      output.on('close', function() {
        const bytes = archive.pointer();
        resolve({ bytes });
      });

      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          reject(err);
        }
      });

      // Setup archiver events.
      archive.on('error', err => reject(err));
      archive.on('progress', data => {
        if (onProgress) {
          const { entries, fs } = data;
          onProgress({
            isComplete: entries.processed === entries.total,
            percent: entries.processed / entries.total,
            total: entries.total,
            processed: entries.processed,
            bytes: {
              total: fs.totalBytes,
              processed: fs.processedBytes,
            },
          });
        }
        // console.log('data', data);
      });
      archive.pipe(output);

      // Add the items.
      for (const item of this.items) {
        const source = fsPath.resolve(item.source);
        const stat = await fs.lstat(source);
        if (stat.isDirectory()) {
          archive.directory(source, item.dest || '');
        } else {
          let name = fsPath.basename(source);
          name = item.dest ? fsPath.join(item.dest, name) : name;
          archive.file(source, { name });
        }
      }

      // Start the zipping.
      archive.finalize();
    });
  }
}
