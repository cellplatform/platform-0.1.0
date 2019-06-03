import * as crypto from 'crypto';
import { fs, time, download, t } from './common';
const SHA256 = 'sha256';

/**
 * Manage a download bundle.
 */
export class Bundle {
  /**
   * [Static]
   */

  /**
   * Creates an hash of the file at the given path.
   */
  public static checksum(path: string) {
    return new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash(SHA256);
      const stream = fs.createReadStream(path);
      stream.on('data', data => hash.update(data, 'utf8'));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', err => reject(err));
    });
  }

  /**
   * Checks that the bundle is valid.
   */
  public static async isValid(args: { checksum: string; path: string; throw?: boolean }) {
    const checksum = await Bundle.checksum(args.path);
    const isValid = checksum === args.checksum;
    if (!isValid && args.throw) {
      throw new Error(
        `The bundle at '${args.path}' differs from the original (checksum: ${checksum})`,
      );
    }
    return isValid;
  }

  /**
   * Zip up an application bundle creating an downloadable archive with security checksum.
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
    const info: t.IBundleInfo = {
      name: pkg.name,
      version: pkg.version,
      createdAt: time.now.timestamp,
      file: fs.basename(bundlePath),
      size: size.toString(),
      bytes: size.bytes,
      checksum: await Bundle.checksum(bundlePath),
      hash: SHA256,
    };
    const json = JSON.stringify(info, null, '  ');
    const infoPath = fs.join(dir, 'info.json');
    await fs.writeFile(infoPath, json);

    // Package both bundle and zip into a single downloadable archive.
    const downloadPath = fs.join(dir, `${pkg.version}.zip`);
    await fs
      .zip(bundlePath)
      .add(infoPath)
      .save(downloadPath);

    // Delete the original bundle.
    await fs.remove(bundlePath);

    // Finish up.
    return info;
  }

  /**
   * Downloads the bundle at the given URL.
   */
  public static async download(args: { url: string; dir: string; checksum?: string }) {
    const { url, dir } = args;
    const rootDir = fs.resolve(args.dir);
    const filename = fs.basename(args.url);
    await fs.ensureDir(rootDir);

    // Download from the network.
    const downloadFile = fs.join(rootDir, filename);
    await download(url).save(downloadFile);
    if (!(await fs.pathExists(downloadFile))) {
      throw new Error(`Failed to download file at ${url}.`);
    }

    // Unzip the download.
    await fs.unzip(downloadFile, dir);
    await fs.remove(downloadFile);
    const info = (await fs.readJson(fs.join(dir, 'info.json'))) as t.IBundleInfo;

    // Ensure the bundle is valid if a checksum verification hash was passed.
    const bundleFile = fs.join(dir, 'bundle.zip');
    if (args.checksum) {
      await Bundle.isValid({ checksum: args.checksum, path: bundleFile, throw: true });
    }

    // Unzip the bundle.
    await fs.unzip(bundleFile, dir);

    // Finish up.
    return { ...info, dir };
  }
}
