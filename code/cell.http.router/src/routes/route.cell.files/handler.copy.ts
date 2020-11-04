import { HttpClient, t, Uri } from '../common';

type Error = t.IResPostCellFilesCopyError;
type ErrorType = Error['error'];
type Item = {
  filename: string;
  target: NonNullable<t.IHttpClientCellFileCopyTarget>;
  localhost: boolean;
};

export async function copyCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  body: t.IReqPostCellFilesCopyBody;
  host: string;
}) {
  const { db, fs, cellUri, body } = args;
  const data: t.IResPostCellFilesCopyData = { errors: [] };
  const client = HttpClient.create(args.host).cell(cellUri);

  const done = () => {
    const hasError = data.errors.length !== 0;
    const status = hasError ? 500 : 200;
    return { status, data };
  };

  const toTargetUri = (target: t.IHttpClientCellFileCopyTarget) => {
    const parsed = Uri.parse<t.ICellUri>(target.uri);
    const uri = parsed.toString();
    const error: ErrorType = 'TARGET_URI_INVALID';
    return parsed.error || parsed.type !== 'CELL' ? { uri, error } : { uri };
  };

  // Prepare incoming copy instructions.
  const items: Item[] = [];
  await Promise.all(
    body.files.map(async (file) => {
      const errors: Error[] = [];

      // Ensure the URI is valie.
      const targetUri = toTargetUri(file.target);
      if (targetUri.error) {
        errors.push({ file, error: targetUri.error });
      }

      // Ensure a filename was provided.
      const filename = (file.filename || '').trim();
      if (!filename) {
        errors.push({ file, error: 'SOURCE_FILENAME_EMPTY' });
      }

      const host = (file.target.host || '').trim() || args.host;
      const local = host === args.host;

      // Ensure file exists.
      if (filename) {
        const fileInfo = await client.file.name(filename).info();
        if (fileInfo.status === 404) {
          errors.push({ file, error: 'SOURCE_FILE_404' });
        }
      }

      // Add to processing list.
      data.errors.push(...errors);
      if (errors.length === 0) {
        items.push({
          localhost: local,
          filename,
          target: { uri: targetUri.uri, host, filename: file.target.filename || filename },
        });
      }
    }),
  );

  console.log('items::', items);

  // fs.

  return done();
}

/**
 * Helpers
 */
