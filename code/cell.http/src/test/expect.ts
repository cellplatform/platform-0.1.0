import { expect, expectError } from '@platform/test';
import { fs, Schema, t } from '../server/common';

export { expect, expectError };

export const expectFileInFs = async (fileUri: string, exists: boolean) => {
  const { file, ns } = Schema.uri.parse<t.IFileUri>(fileUri).parts;
  const path = fs.resolve(`tmp/fs/ns.${ns}/${file}`);
  expect(await fs.pathExists(path)).to.eql(exists);
};
