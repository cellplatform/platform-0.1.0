import { fs, semver } from '../common';
import * as prompt from './util';

/**
 * Prompt via the CLI to increment the NPM version.
 */
export async function incrementVersion(options: { path?: string; save?: boolean } = {}) {
  const path = fs.resolve(options.path || './package.json');
  const pkg = await fs.file.loadAndParse<{ version: string }>(path);
  const version = pkg.version;

  // Prepare version optinos.
  const asOption = (level: semver.ReleaseType, prerelease?: 'alpha' | 'beta') => {
    const value = semver.inc(version, level, prerelease as any) || undefined;
    let name = (prerelease ? prerelease : level) as string;
    name = `${name}    `.substring(0, 5);
    name = `${name}  ➜  ${value}`;
    const option: prompt.IOption = { name, value };
    return option;
  };
  const items = [
    asOption('major'),
    asOption('minor'),
    asOption('patch'),
    asOption('prerelease', 'alpha'),
    asOption('prerelease', 'beta'),
  ];

  // Prompt the user.
  const message = `increment version (${version})`;
  const next = await prompt.list({ message, items });

  // Save the change.
  if (options.save) {
    pkg.version = next;
    await fs.file.stringifyAndSave(path, pkg);
  }

  // Finish up.
  return next;
}
