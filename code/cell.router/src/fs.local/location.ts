import { t, Schema } from '../common';

/**
 * Ensures all location fields on local file-system DB entries are in their
 * absolute-path form.
 */
export function ensureAbsoluteLocations(args: {
  fs: t.IFileSystem;
  files: t.IFileMap<t.IFileData>;
}) {
  const { fs } = args;
  const files = { ...args.files };
  const root = fs.dir;

  Object.keys(files).forEach((fileid) => {
    const data = files[fileid];
    const path = data?.props.location;
    if (data && path?.startsWith('file://~')) {
      const location = Schema.File.Path.Local.toAbsoluteLocation({ path, root });
      files[fileid] = { ...data, props: { ...data.props, location } };
    }
  });

  return files;
}
