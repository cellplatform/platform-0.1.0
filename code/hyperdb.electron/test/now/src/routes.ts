import { constants, create, Db, express, fs, Swarm } from './common';

export const router = express.Router();

type Ref = { db: Db; swarm: Swarm; name: string; dir: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * Create a new DB instance.
 */
async function createDb(args: { dbKey: string }) {
  const { dbKey } = args;
  const name = `${dbKey}.db`;
  const dir = fs.join(constants.TMP, name);
  const { db, swarm } = await create({ dir, dbKey });
  return { dir, name, db, swarm };
}

/**
 * Retrieve the requested DB.
 */
async function getOrCreateDb(args: { dbKey: string }) {
  const { dbKey } = args;
  return refs[dbKey] ? refs[dbKey] : (refs[dbKey] = await createDb(args));
}

/**
 * Gets details for a specific database.
 */
router.get('/db/:dbKey', async (req, res) => {
  const dbKey = req.params.dbKey as string;
  if (!dbKey) {
    res.status(400).send({ error: 'dbKey not specified' });
  }

  const { db } = await getOrCreateDb({ dbKey });

  const getValue = async (key: string) => (await db.get(key)).value;
  const values = {
    A1: await getValue('A1'),
    A2: await getValue('A2'),
  };

  res.send({ dbKey, values });
});

/**
 * Status info on all databases..
 */
router.get('/db', async (req, res) => {
  const items = Object.keys(refs).map(key => refs[key]);
  const databases = items.map(ref => ref.name);
  const tmp = constants.TMP;
  res.send({ tmp, databases });
});

/**
 * Wildcard
 */
router.get('*', async (req, res) => {
  res.send({ message: '👋' });
});
