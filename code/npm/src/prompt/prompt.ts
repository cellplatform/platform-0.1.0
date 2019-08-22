import { fs, semver } from '../common';
import { prompt } from '@platform/cli.prompt';

/**
 * Prompt via the CLI to increment the NPM version.
 */
export async function incrementVersion(
  options: { path?: string; save?: boolean; noChange?: boolean } = {},
) {
  const path = fs.resolve(options.path || './package.json');
  const pkg = await fs.file.loadAndParse<{ version: string }>(path);
  const version = pkg.version;

  // Prepare version optinos.
  const asOption = (level: semver.ReleaseType, prerelease?: 'alpha' | 'beta') => {
    const value = semver.inc(version, level, prerelease as any) || undefined;
    let name = (prerelease ? prerelease : level) as string;
    name = `${name}    `.substring(0, 5);
    name = `${name}  ➜  ${value}`;
    const option: prompt.IPromptListOption = { name, value };
    return option;
  };
  const items = [
    asOption('patch'),
    asOption('minor'),
    asOption('major'),
    '----',
    asOption('prerelease', 'alpha'),
    asOption('prerelease', 'beta'),
  ];

  if (options.noChange) {
    items.push('----');
    items.push({ name: 'no change', value: version });
  }

  // Prompt the user.
  const message = `increment version (${version})`;
  const next = await prompt.list({ message, items, pageSize: 10 });

  // Save the change.
  if (options.save && next !== version) {
    pkg.version = next;
    await fs.file.stringifyAndSave(path, pkg);
  }

  // Finish up.
  return next;
}
