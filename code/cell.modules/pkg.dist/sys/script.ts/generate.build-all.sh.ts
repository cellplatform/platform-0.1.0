import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

/**
 * Generate a '.sh' script to run the build command on all
 * projects directly within the given source directory location.
 */
export async function generate(args: { sourceDir: string; targetFile: string }) {
  /**
   * Wrangle paths
   */
  const targetFile = fs.resolve(args.targetFile);
  // const sourceDir = fs.resolve(args.sourceDir);
  const sourceDirs = (await fs.readdir(fs.resolve(args.sourceDir)))
    .filter((name) => !name.startsWith('.'))
    .map((name) => fs.join(name));

  /**
   * Build script
   */
  let script = `#!/bin/bash
# exit when any command fails
set -e
cd ${args.sourceDir}

echo building:`;

  sourceDirs.forEach((dir) => (script += `\necho " • ${dir}"`));
  script += '\necho \n\n';

  sourceDirs.forEach((dir, i) => {
    if (i > 0) script += `cd ..\n`;

    script += `
cd "${dir}"
pwd
yarn build
`;
  });

  /**
   * Save output.
   */
  await fs.writeFile(fs.resolve(args.targetFile), script);

  // Finish up.
  log.info.gray(`file generated:\n ${log.white(targetFile)}`);
}

/**
 * Run
 */
generate({
  sourceDir: '../../pkg.sys',
  targetFile: 'tmp/build-all.sh',
});
