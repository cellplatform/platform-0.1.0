import { fs, IPackageJson, IResult, paths, result } from '../common';

/**
 * Runs an NPM publish.
 */
export async function publish(
  args: { silent?: boolean; dir?: string; outDir?: string } = {},
): Promise<IResult> {
  const dir = args.dir || (await paths.closestParentOf('tsconfig.json'));
  if (!dir) {
    return result.fail(`A 'tsconfig.json' file could not be found.`);
  }

  const tsconfig = await paths.tsconfig(dir);
  if (!tsconfig.success) {
    return result.fail(`Failed to load the 'tsconig.json' file.`);
  }

  let outDir = args.outDir || tsconfig.outDir;
  if (!outDir) {
    return result.fail(`The 'tsconfig.json' does not contain an 'outDir'.`);
  }
  outDir = fs.resolve(outDir);

  const modules = fs.join(dir, 'node_modules');
  // const outDir = fs.resolve('.publish');

  console.group('\n\n🐷  TODO publish\n');
  console.log('modules', modules);
  console.log('tsconfig', tsconfig);
  console.log('outDir', outDir);
  console.log('\n\n');
  console.groupEnd();

  try {
    const tmp = fs.resolve('.publish');
    // const rootDir = fs;

    await copyPackageJson({ rootDir: dir, target: tmp });

    await fs.copy(outDir, tmp);

    return result.success();
  } catch (error) {
    return result.fail(error);
  }
}

/**
 * INTERNAL
 */
async function copyPackageJson(args: { rootDir: string; target: string }) {
  try {
    // Setup initial conditions.
    await fs.ensureDir(args.target);

    // Prepare paths.
    const packagePath = (dir: string) =>
      fs.resolve(fs.join(dir, 'package.json'));
    const source = packagePath(args.rootDir);
    const target = packagePath(args.target);

    // Update [package.json] file.
    const pkg = await fs.file.loadAndParse<IPackageJson>(source);
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
    await fs.writeFile(target, json);

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
