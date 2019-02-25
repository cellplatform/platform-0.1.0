import { constants, create, Db, express, fs, Swarm, is } from './common';
const pkg = require('../package.json');

export const router = express.Router();

type Ref = { db: Db; swarm: Swarm; name: string; dir: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * Create a new DB instance.
 */
async function createDb(args: { dbKey: string; reset?: boolean }) {
  const { dbKey, reset } = args;
  const name = `${dbKey}.db`;
  const dir = fs.join(constants.TMP, name);
  if (reset) {
    await fs.remove(dir);
  }
  const { db, swarm } = await create({ dir, dbKey });
  return { dir, name, db, swarm };
}

/**
 * Retrieve the requested DB.
 */
async function getOrCreateDb(args: { dbKey: string; reset?: boolean }) {
  const { dbKey, reset } = args;
  if (reset) {
    delete refs[dbKey];
  }
  return refs[dbKey] ? refs[dbKey] : (refs[dbKey] = await createDb(args));
}

/**
 * Gets details for a specific database.
 */
router.get('/:dbKey', async (req, res) => {
  try {
    const dbKey = req.params.dbKey as string;
    const reset = req.query.reset !== undefined;
    const version = req.query.version !== undefined;
    let payload: any = {};

    const { db } = await getOrCreateDb({ dbKey, reset });
    payload = { ...payload, db: db.key };

    if (version) {
      payload = { ...payload, version: await db.version() };
    }

    res.send(payload);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Gets the value at the given key.
 */
router.get('/:dbKey/:key', async (req, res) => {
  try {
    const dbKey = req.params.dbKey as string;
    const key = req.params.key as string;
    const reset = req.query.reset !== undefined;
    let payload: any = {};

    payload = reset ? { ...payload, reset } : payload;

    const { db } = await getOrCreateDb({ dbKey, reset });
    const data = await db.get(key);

    const { value, meta } = data;
    const { exists, deleted } = meta;

    payload = { ...payload, db: dbKey, key, value, exists, deleted };

    res.send(payload);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Status info on all databases.
 */
router.get('*', async (req, res) => {
  try {
    const items = Object.keys(refs).map(key => refs[key]);
    const dbs = items.map(ref => ref.name);
    res.send({
      message: '👋',
      version: pkg.version,
      dbs,
      is: is.toObject(),
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
