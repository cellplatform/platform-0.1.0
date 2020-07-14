import { IFs } from '@platform/fs.types';
import { INpmPackageJson } from '@platform/types';

/**
 * Reads a [package.json] file and saves key fields out
 * as typescript constants.
 */
export async function savePackage(args: {
  fs: IFs;
  source?: string;
  target: string;
  fields?: (keyof INpmPackageJson)[];
  const?: string;
}) {
  const { fs, fields = ['name', 'version'] } = args;

  const source = fs.resolve(args.source || 'package.json');
  const target = fs.resolve(args.target);

  // Load the source JSON.
  if (!(await fs.exists(source))) {
    throw new Error(`Source [package.json] does not exist. ${source}`);
  }

  let json: INpmPackageJson = {};
  try {
    const text = (await fs.readFile(source)).toString();
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse [package.json]. ${source}`);
  }

  // Build output string.
  let text = `export const ${args.const || 'PKG'} = {\n`;
  const add = (key: string, value: string | Record<string, unknown> | string[]) => {
    if (typeof value === 'string') {
      text += `  ${key}: '${value}',\n`;
      return;
    }

    if (Array.isArray(value)) {
      const items = value.map((item) => `'${item}'`).join(', ');
      text += `  ${key}: [${items}],\n`;
      return;
    }

    if (typeof value === 'object') {
      text += `  ${key}: {\n`;
      Object.keys(value).forEach((key) => {
        text += `    '${key}': '${value[key]}',\n`;
      });

      text += `  },\n`;

      return;
    }
  };

  Object.keys(json)
    .filter((key) => fields.includes(key as keyof INpmPackageJson))
    .forEach((key) => add(key, json[key]));
  text += `};\n`;

  // Save to target.
  await fs.ensureDir(fs.dirname(target));
  await fs.writeFile(target, text);
}
