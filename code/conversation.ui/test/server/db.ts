import { fs, t } from './common';
import hyperdb from '@platform/hyperdb';

const dir = fs.resolve('./.dev/db');

export const getDb: t.GetConverstaionDb = async () => {
  const res = await hyperdb.getOrCreate<t.IConversationDbModel>({ dir, connect: false });
  return res.db;
};
