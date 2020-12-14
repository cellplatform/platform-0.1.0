import { HttpClient, t, Uri, util, Schema, constants } from '../common';
import { cellInfo } from '../route.cell';
import { uploadCellFilesComplete } from './handler.upload.complete';

type Item = { source: Address; target: Address; file: t.IHttpClientCellFileCopy };
type Address = t.IResPostCellFileCopyAddress;

export async function copyCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  body: t.IReqPostCellFilesCopyBody;
  host: string;
  changes?: boolean;
  permission?: t.FsS3Permission;
}) {
  const { db, fs, cellUri, body, changes: sendChanges, permission } = args;
  const items: Item[] = [];
  const errors: t.IResPostCellFilesCopyError[] = [];
  const changes: t.IDbModelChange[] = [];
  const sourceClient = HttpClient.create(args.host).cell(cellUri);

  const done = () => {
    const hasError = errors.length !== 0;
    const status = hasError ? 500 : 200;
    const data: t.IResPostCellFsCopyData = {
      files: items.map(({ source, target }) => ({ source, target })),
      errors,
      changes,
    };
    return { status, data };
  };

  const parseCellUri = (target: t.IHttpClientCellFileCopyTarget) => {
    const parsed = Uri.parse<t.ICellUri>(target.uri);
    const uri = parsed.toString();
    const error = parsed.type !== 'CELL' ? `A cell URI is required.` : parsed.error;
    return { uri, error };
  };

  const getFileUri = async (host: string, cellUri: string, filename: string) => {
    const res = (await cellInfo({ host, db, uri: cellUri })) as t.IPayload<t.IResGetCell>;
    if (res.status === 404) {
      return { uri: undefined };
    }
    if (!util.isOK(res.status)) {
      return { error: `Cell file information for [${cellUri}] could not be retrieved.` };
    }
    const links = res.data.data.links || {};
    const key = Schema.file.links.toKey(filename);
    const value = links[key];
    const parsed = value ? Schema.file.links.parseValue(links[key]) : undefined;
    return { uri: parsed?.uri };
  };

  const toAddress = async (host: string, cellUri: string, filename: string) => {
    const file = await getFileUri(host, cellUri, filename);
    if (file.error) {
      return { error: file.error };
    } else {
      const exists = Boolean(file.uri);
      const ns = Uri.toNs(cellUri).toString();
      const fileUri = file.uri ? file.uri?.toString() : Uri.create.file(ns, Uri.slug());
      const address: Address = {
        host,
        filename,
        cell: cellUri,
        file: fileUri,
        status: exists ? 'EXISTING' : 'NEW',
      };
      return { address };
    }
  };

  // Prepare incoming copy instructions.
  await Promise.all(
    body.files.map(async (file) => {
      const addError = (message: string) => errors.push({ file, message });

      try {
        // Ensure a filename was provided.
        const filename = (file.filename || '').trim();

        // Ensure the target URI is valid.
        const targetUri = parseCellUri(file.target);
        if (targetUri.error) {
          const uri = file.target.uri;
          addError(`The URI [${uri}] of the target cell to copy to is invalid. ${targetUri.error}`);
        }

        // Ensure the source file exists.
        if (!filename) {
          addError(`A filename was not provided.`);
        } else {
          const info = await sourceClient.file.name(filename).info();
          if (info.status === 404 || !info.body.exists) {
            addError(
              `The filename/path '${filename}' does not exist on the source cell [${cellUri}]`,
            );
          }
        }

        // Retrieve source file URI.
        if (filename && errors.length === 0) {
          const source = await toAddress(args.host, cellUri, filename);
          if (source.error) {
            addError(`Failed to get file uri for '${filename}' in [${cellUri}]`);
          }

          const targetFilename = file.target.filename || filename;
          const targetHost = (file.target.host || '').trim() || args.host;
          const target = await toAddress(targetHost, targetUri.uri, targetFilename);
          if (target.error) {
            addError(`Failed to get file uri for '${targetFilename}' in [${targetUri.uri}]`);
          }

          // Add to processing list.
          if (errors.length === 0 && source.address && target.address) {
            items.push({
              file,
              source: source.address,
              target: target.address,
            });
          }
        }
      } catch (error) {
        addError(`Failed while preparing to copy '${file.filename}'. ${error.message}`);
      }
    }),
  );

  const uploadToTargetHost = async (item: Item) => {
    const addError = (message: string) => errors.push({ file: item.file, message });

    try {
      const { source, target } = item;
      const path = util.fs.join(constants.PATH.TMP, 'file', `tmp.${Schema.cuid()}`);
      const download = await sourceClient.file.name(source.filename).download();

      await util.fs.stream.save(path, download.body);

      const data = await util.fs.readFile(path);
      const file: t.IHttpClientCellFileUpload = { filename: target.filename, data };

      const client = HttpClient.create(target.host).cell(target.cell);
      const res = await client.fs.upload(file, { changes: sendChanges, permission });
      const { ok } = res;

      if (!ok) {
        const err = res.error?.message || '';
        addError(
          `Failed while uploading file '${target.filename}' to host '${target.host}' (${res.status}). ${err}`.trim(),
        );
      }

      if (ok) {
        changes.push(...(res.body.changes || []));
      }

      await util.fs.remove(path);
      return { ok };
    } catch (error) {
      addError(`Failed while uploading '${item.file.filename}'. ${error.message}`);
      return { ok: false };
    }
  };

  const process = async (item: Item) => {
    const addError = (message: string) => errors.push({ file: item.file, message });

    try {
      if (item.source.host !== item.target.host) {
        // COPY using upload to remote host
        await uploadToTargetHost(item);
      } else {
        if (item.target.status === 'NEW') {
          /**
           * Target file does not yet exist, upload it.
           */
          await uploadToTargetHost(item);
        } else {
          /**
           * Target file does exist, copy of it.
           */
          const source = item.source.file;
          const target = item.target.file;
          let failed = false;
          if (fs.type === 'S3') {
            const res = await fs.copy(source, target, { permission });
            if (!res.ok) {
              failed = true;
            }
          } else {
            const res = await fs.copy(source, target);
            if (!res.ok) {
              failed = true;
            }
          }

          if (!failed) {
            const body: t.IReqPostCellFilesUploadCompleteBody = {};
            const res = await uploadCellFilesComplete({
              db,
              host: item.target.host,
              cellUri: item.target.cell,
              body,
              changes: sendChanges,
            });

            if (!util.isOK(res.status)) {
              addError(
                `Failed while completing upload of file '${item.target.file}' to host '${item.target.host}'`,
              );
            }
            changes.push(...(res.data.data.changes || []));
          }
        }
      }
    } catch (error) {
      addError(`Failed while copying '${item.file.filename}'. ${error.message}`);
    }
  };

  for (const item of items) {
    await process(item);
  }

  return done();
}
