import { cli, fs } from '../common';
import { toPayloadSize } from './syncDir.payload';
import * as t from './types';
import * as util from './util';

/**
 * Converts a set of payload items into batches of sync tasks.
 */
export function toBatches(args: { items: t.IPayloadItem[]; maxBytes: number }) {
  const result: t.IPayloadItem[][] = [];
  let bytes = 0;
  let index = 0;
  fs.sort
    .objects(args.items, item => item.filename)
    .forEach(item => {
      bytes += item.bytes;
      const increment = bytes >= args.maxBytes;
      if (increment) {
        bytes = item.bytes;
        index++;
      }
      result[index] = result[index] || [];
      result[index].push(item);
    });

  return result;
}

/**
 * Adds a sync task to a task list.
 */
export function addTask(args: {
  tasks: cli.ITasks;
  items: t.IPayloadItem[];
  targetUri: t.IUriParts<t.ICellUri>;
  client: t.IClient;
  logResults: t.LogResults;
}) {
  const { tasks, logResults } = args;
  const clientFiles = args.client.cell(args.targetUri.toString()).files;
  const pushes = args.items.filter(item => item.status !== 'DELETED');
  const deletions = args.items.filter(item => item.status === 'DELETED');
  const title = taskTitle({ pushes, deletions });

  tasks.task(title, async () => {
    // Changes.
    const uploadFiles = pushes.map(({ filename, data }) => ({
      filename,
      data,
    })) as t.IClientCellFileUpload[];

    if (uploadFiles.length > 0) {
      const res = await clientFiles.upload(uploadFiles);
      if (res.ok) {
        logResults({ uploaded: uploadFiles.map(item => item.filename) });
      } else {
        const err = `${res.status} Failed while uploading.`;
        throw new Error(err);
      }
    }

    // Deletions.
    const deleteFiles = deletions.map(item => item.filename);
    if (deleteFiles.length > 0) {
      const res = await clientFiles.delete(deleteFiles);
      if (res.ok) {
        logResults({ deleted: deleteFiles });
      } else {
        const err = `${res.status} Failed while deleting.`;
        throw new Error(err);
      }
    }
  });

  // Finish up.
  return tasks;
}

/**
 * [Helpers]
 */

const taskTitle = (args: { pushes: t.IPayloadItem[]; deletions: t.IPayloadItem[] }) => {
  const { pushes, deletions } = args;

  let title = '';
  const append = (text: string, divider = ' ') => {
    title = title.trim();
    title = `${title}${title ? divider : ''}${text}`.trim();
  };

  if (pushes.length > 0) {
    const size = toPayloadSize(pushes);
    const total = pushes.length;
    append(`push ${total} ${util.plural.file.toString(total)} (${size.toString()})`);
  }

  if (deletions.length > 0) {
    const total = deletions.length;
    append(`delete ${total} ${util.plural.file.toString(total)}`, ', ');
  }

  return title;
};
