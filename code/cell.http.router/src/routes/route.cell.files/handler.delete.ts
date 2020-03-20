import { models, Schema, t, util } from '../common';
import { deleteFile } from '../route.file';

export async function deleteCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  body: t.IReqDeleteCellFilesBody;
  host: string;
}) {
  const { host, db, fs, cellUri, body } = args;

  // Extract values from request body.
  const action = body.action;
  const filenames = (body.filenames || [])
    .map(text => (text || '').trim())
    .filter(text => Boolean(text));

  const data: t.IResDeleteCellFilesData = {
    uri: cellUri,
    deleted: [],
    unlinked: [],
    errors: [],
  };

  const error = (error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED', filename: string) => {
    data.errors = [...data.errors, { error, filename }];
  };

  const done = () => {
    const status = data.errors.length === 0 ? 200 : 500;
    return { status, data };
  };

  // Exit if there are no files to operate on.
  if (filenames.length === 0) {
    return done();
  }

  // Retrieve the [Cell] model.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  if (!cell.exists) {
    const msg = `The cell [${cellUri}] does not exist.`;
    return util.toErrorPayload(msg, { status: 404 });
  }

  // Parse file-names into usable link details.
  const links = cell.props.links || {};
  const items = filenames.map(filename => {
    const key = Schema.file.links.toKey(filename);
    const value = links[key];
    const parts = value ? Schema.file.links.parseLink(value) : undefined;
    const uri = parts ? parts.uri.toString() : '';
    const hash = parts ? parts.hash : '';
    return { filename, key, uri, hash, exists: Boolean(value) };
  });

  // Report any requested filenames that are not linked to the cell.
  items.filter(({ uri }) => !Boolean(uri)).forEach(({ filename }) => error('NOT_LINKED', filename));

  const deleteOne = async (filename: string, fileUri: string) => {
    const res = await deleteFile({ db, fs, fileUri, host });
    if (util.isOK(res.status)) {
      data.deleted = [...data.deleted, filename];
    } else {
      error('DELETING', filename);
    }
  };

  const deleteMany = async () => {
    const wait = items
      .filter(({ uri }) => Boolean(uri))
      .map(async ({ uri, filename }) => deleteOne(filename, uri));
    await Promise.all(wait);
  };

  const unlinkFiles = async () => {
    try {
      const after = { ...links };
      items
        .filter(({ uri }) => Boolean(uri))
        .forEach(({ key, filename }) => {
          delete after[key];
          data.unlinked = [...data.unlinked, filename];
        });
      await cell.set({ links: after }).save();
    } catch (error) {
      items
        .filter(({ uri }) => Boolean(uri))
        .forEach(({ filename }) => error('UNLINKING', filename));
    }
  };

  // Perform requested actions.
  if (action === 'DELETE') {
    await deleteMany();
    await unlinkFiles();
    return done();
  } else if (action === 'UNLINK') {
    await unlinkFiles();
    return done();
  } else {
    const invalidAction = action || '<empty>';
    const msg = `A valid action (DELETE | UNLINK) was not provided in the body, given:${invalidAction}.`;
    return util.toErrorPayload(msg, { status: 400 });
  }
}
