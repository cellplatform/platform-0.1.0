import { models, routes, Schema, t, util } from '../common';
import { deleteFileResponse } from '../route.file';
import { getParams } from './cell.files.params';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * DELETE file(s) from a cell.
   */
  router.delete(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryCellFilesDelete;
    const params = req.params as t.IUrlParamsCellFiles;

    const paramData = getParams({ params });
    const { status, error, ns, uri: cellUri, key: cellKey } = paramData;
    if (!paramData.ns || error) {
      return { status, data: { error } };
    }

    try {
      // Extract values from request body.
      const body = (await req.body.json()) as t.IReqDeleteCellFilesBody;
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
        const uri = parts ? parts.uri : '';
        const hash = parts ? parts.hash : '';
        return { filename, key, uri, hash, exists: Boolean(value) };
      });

      // Report any requested filenames that are not linked to the cell.
      items
        .filter(({ uri }) => !Boolean(uri))
        .forEach(({ filename }) => error('NOT_LINKED', filename));

      const deleteFile = async (filename: string, uri: string) => {
        const res = await deleteFileResponse({ db, fs, uri, host });
        if (util.isOK(res.status)) {
          data.deleted = [...data.deleted, filename];
        } else {
          error('DELETING', filename);
        }
      };

      const deleteFiles = async () => {
        const wait = items
          .filter(({ uri }) => Boolean(uri))
          .map(async ({ uri, filename }) => deleteFile(filename, uri));
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
      switch (action) {
        case 'DELETE':
          await deleteFiles();
          await unlinkFiles();
          return done();
        case 'UNLINK':
          await unlinkFiles();
          return done();
        default:
          const invalidAction = action || '<empty>';
          const msg = `A valid action (DELETE | UNLINK) was not provided in the body, given:${invalidAction}.`;
          return util.toErrorPayload(msg, { status: 400 });
      }
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}
