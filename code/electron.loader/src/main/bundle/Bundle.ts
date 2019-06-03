import * as crypto from 'crypto';
import { fs, time } from '../common';

/**
 * Manage a download bundle
 */
// export function bundle(args: { path?: string; url: string }) {
//   const { url, path } = args;
//   console.log('url', url);
//   console.log('path', path);
// }

export class Bundle {
  /**
   * [Static]
   */
  public static async zip(args: { source: { main: string; renderer: string }; target: string }) {
    const { source } = args;
    const pkg = (await fs.readJson(fs.resolve('./package.json'))) as {
      name: string;
      version: string;
    };

    const dir = fs.join(fs.resolve(args.target), pkg.version);
    const bundlePath = fs.join(dir, 'bundle.zip');
    await fs.ensureDir(dir);
    await fs
      .zip(fs.resolve(source.main), 'main')
      .add(fs.resolve(source.renderer), 'renderer')
      .save(bundlePath);

    // Save info.
    const size = await fs.size.file(bundlePath);
    const info = {
      name: pkg.name,
      version: pkg.version,
      createdAt: time.now.timestamp,
      bytes: size.bytes,
      size: size.toString(),
      hash: await Bundle.hash(bundlePath),
    };
    const json = JSON.stringify(info, null, '  ');
    const infoPath = fs.join(dir, 'info.json');
    await fs.writeFile(infoPath, json);

    // Package both bundle and zip into a single downloadable archive.
    const downloadPath = fs.join(dir, `${pkg.version}.zip`);
    await fs
      .zip(bundlePath, 'bundle.zip')
      .add(infoPath, 'info.json')
      .save(downloadPath);

    // Delete the original bundle.
    await fs.remove(bundlePath);
  }

  /**
   * Creates an MD5 hash of the file at the given path.
   */
  public static hash(path: string) {
    return new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(path);
      stream.on('data', data => hash.update(data, 'utf8'));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', err => reject(err));
    });
  }
}
