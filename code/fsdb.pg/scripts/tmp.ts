import * as pg from 'pg';

import { PgDoc } from '../src';

(async () => {
  const client = new pg.Pool({
    user: 'dev',
    host: 'localhost',
    database: 'test',
  });

  const db = PgDoc.create({
    db: {
      user: 'dev',
      host: 'localhost',
      database: 'test',
    },
  });

  const putRes = await db.putMany([
    { key: 'FOO/bar', value: { msg: 'boo' } },
    { key: 'BOO/2', value: 123 },
  ]);

  await db.put('BOO/2', 888);
  // console.log('putRes', putRes);
  // await db.put('BOO/2', 123);

  // console.log('-------------------------------------------');
  // const getMany = await db.getMany(['FOO/bar', 'FOO/bax', 'BOO/2']);
  // console.log('getMany', getMany);

  db.dispose();

  // console.log('db.toString()', db.toString());
  // console.log('db', db);

  // await client.connect();

  await client.query(`    DROP TABLE IF EXISTS "FOO"  `);

  //   // return;

  //   await client.query(`
  //     CREATE TABLE IF NOT EXISTS "public"."cards" (
  //       "id" serial,
  //       "board" integer NOT NULL,
  //       "data" jsonb,
  //       "path" text,
  //       PRIMARY KEY ("id")
  //     );
  //  `);

  //   await client.query(`
  //   INSERT INTO cards VALUES (1, 1, '{"name": "Paint house", "tags": ["Improvements", "Office"], "finished": true}', '/foo/1');
  //   INSERT INTO cards VALUES (2, 1, '{"name": "Wash dishes", "tags": ["Clean", "Kitchen"], "finished": false}', '/foo/2');
  //   INSERT INTO cards VALUES (3, 1, '{"name": "Cook lunch", "tags": ["Cook", "Kitchen", "Tacos"], "ingredients": ["Tortillas", "Guacamole"], "finished": false}', 'foo/3');
  //   INSERT INTO cards VALUES (4, 1, '{"name": "Vacuum", "tags": ["Clean", "Bedroom", "Office"], "finished": false}', 'bar/foo/123');
  //   INSERT INTO cards VALUES (5, 1, '{"name": "Hang paintings", "tags": ["Improvements", "Office"], "finished": false}', 'bar/foo');
  //   `);

  //   const res = await client.query(`
  //     SELECT * from cards
  //     WHERE path ~ '^/foo'
  //   `);

  //   console.log('res', res);

  //   res.rows.forEach(row => {
  //     console.log('row', row);
  //   });

  //   console.log('-------------------------------------------');
  //   console.log('count', res.rowCount);

  //   // const res = await client.query(`SELECT * FROM cards WHERE data->>'finished' = 'true';`);

  //   // console.log('res', res);

  await client.end();
})();
