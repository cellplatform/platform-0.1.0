import {
  // exec,
  paths,
  join,
  IPackageJson,
  resolve,
  fs,
} from '../common';

export type IPublishResult = {
  success: boolean;
  error?: Error;
};

/**
 * Runs an NPM publish.
 */
export async function publish(
  args: { silent?: boolean } = {},
): Promise<IPublishResult> {
  const dir = paths.closestParentOf('package.json');
  if (!dir) {
    const error = new Error(`A 'package.json' file could not be found.`);
    return { success: false, error };
  }

  const modules = join(dir, 'node_modules');
  // const outDir = resolve('.publish');
  console.log('modules', modules);

  try {
    const rootDir = '.';
    const outDir = '.publish';

    await copyPackageJson({ rootDir, outDir });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * INTERNAL
 */

async function copyPackageJson(args: { rootDir: string; outDir: string }) {
  try {
    // Setup initial conditions.
    fs.ensureDirSync(args.outDir);

    // Prepare paths.
    const toPackagePath = (dir: string) => resolve(join(dir, 'package.json'));
    const source = toPackagePath(args.rootDir);
    const target = toPackagePath(args.outDir);

    // Update [package.json] file.
    const pkg = JSON.parse(fs.readFileSync(source, 'utf8')) as IPackageJson;
    pkg.types = pkg.types ? toParent(pkg.types) : pkg.types;
    pkg.main = pkg.main ? toParent(pkg.main) : pkg.main;
    pkg.main = pkg.main ? removeExtension(pkg.main) : pkg.main;
    delete pkg.devDependencies;
    if (pkg.scripts) {
      delete pkg.scripts.prepare;
    }
    delete pkg.files;

    // Save.
    const json = `${JSON.stringify(pkg, null, '  ')}\n`;
    fs.writeFileSync(target, json);

    // Finish up.
    return { success: true, source, target };
  } catch (error) {
    return { success: false, error };
  }
}

const toParent = (path: string) =>
  path
    .replace(/^\.\//, '')
    .split('/')
    .slice(1)
    .join('/');

const removeExtension = (path: string) =>
  path.substr(0, path.length - fs.extname(path).length);
