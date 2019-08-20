import { fs, log, t, util } from '../common';

export async function bundle(args: { bundleDir: string; manifest: t.IBundleManifest }) {
  const { bundleDir, manifest } = args;
  const dirSize = await fs.size.dir(bundleDir);

  log.info();
  log.info.gray(`  size:  ${log.magenta(dirSize.toString())}`);
  log.info.gray(`  dir:   ${util.formatPath(bundleDir)}`);
  log.info();
  manifest.files.forEach(file => {
    let name = file;
    name = name.endsWith('.js') ? log.yellow(name) : name;
    name = name.endsWith('.html') ? log.green(name) : name;
    const fileSize = dirSize.files.find(item => item.path.endsWith(`/${file}`));
    let size = fileSize ? fileSize.toString({ round: 0, spacer: '' }) : '';
    size = `${size}        `.substring(0, 8);
    log.info.gray(`         - ${size} ${name}`);
  });
  log.info();
}
