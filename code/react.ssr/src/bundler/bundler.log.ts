import { fs, log, t, util } from '../common';

export async function bundle(args: { bundleDir: string; manifest: t.IBundleManifest }) {
  const { bundleDir, manifest } = args;
  const dirSize = await fs.size.dir(bundleDir);

  log.info();
  log.info.gray(`  size:  ${log.magenta(dirSize.toString())}`);
  log.info.gray(`  dir:   ${util.formatPath(bundleDir)}`);
  log.info();
  manifest.files.forEach(file => {
    const filename = fs.basename(file.path);
    let path = file.path;
    path = path.endsWith('.js') ? log.yellow(path) : path;
    path = path.endsWith('.html') ? log.green(path) : path;
    const fileSize = dirSize.files.find(item => item.path.endsWith(`/${filename}`));
    let size = fileSize ? fileSize.toString({ round: 0, spacer: '' }) : '';
    size = `${size}        `.substring(0, 8);
    log.info.gray(`         - ${size} ${path}`);
  });
  log.info();
}
