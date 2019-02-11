import { fail, paths, IPackageJson, fs, IResult } from '../common';

/**
 * Runs an NPM publish.
 */
export async function publish(
  args: { silent?: boolean; dir?: string; outDir?: string } = {},
): Promise<IResult> {
  const dir = args.dir || paths.closestParentOf('tsconfig.json');
  if (!dir) {
    return fail(`A 'tsconfig.json' file could not be found.`);
  }

  const tsconfig = paths.tsconfig(dir);
  if (!tsconfig.success) {
    return fail(`Failed to load the 'tsconig.json' file.`);
  }

  let outDir = args.outDir || tsconfig.outDir;
  if (!outDir) {
    return fail(`The 'tsconfig.json' does not contain an 'outDir'.`);
  }
  outDir = fs.resolve(outDir);

  const modules = fs.join(dir, 'node_modules');
  // const outDir = fs.resolve('.publish');
  console.log('modules', modules);
  console.log('tsconfig', tsconfig);

  try {
    const tmp = fs.resolve('.publish');
    // const rootDir = fs;

    await copyPackageJson({ rootDir: dir, target: tmp });

    await fs.copy(outDir, tmp);

    console.log('outDir', outDir);

    return { code: 0 };
  } catch (error) {
    return fail(error);
  }
}

/**
 * INTERNAL
 */
async function copyPackageJson(args: { rootDir: string; target: string }) {
  try {
    // Setup initial conditions.
    fs.ensureDirSync(args.target);

    // Prepare paths.
    const toPackagePath = (dir: string) =>
      fs.resolve(fs.join(dir, 'package.json'));
    const source = toPackagePath(args.rootDir);
    const target = toPackagePath(args.target);

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
