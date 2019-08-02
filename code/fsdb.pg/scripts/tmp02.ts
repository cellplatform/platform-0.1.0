import * as pg from 'pg';

(async () => {
  const client = new pg.Pool({
    user: 'dev',
    host: 'localhost',
    database: 'fs',
  });

  // await client.connect();

  await client.query(`    DROP TABLE IF EXISTS cards  `);

  // return;

  await client.query(`
    CREATE TABLE IF NOT EXISTS "public"."cards" (
      "id" serial,
      "board" integer NOT NULL,
      "data" jsonb,
      "path" text,
      PRIMARY KEY ("id")
    );
 `);

  await client.query(`
  INSERT INTO cards VALUES (1, 1, '{"name": "Paint house", "tags": ["Improvements", "Office"], "finished": true}', '/foo/1');
  INSERT INTO cards VALUES (2, 1, '{"name": "Wash dishes", "tags": ["Clean", "Kitchen"], "finished": false}', '/foo/2');
  INSERT INTO cards VALUES (3, 1, '{"name": "Cook lunch", "tags": ["Cook", "Kitchen", "Tacos"], "ingredients": ["Tortillas", "Guacamole"], "finished": false}', 'foo/3');
  INSERT INTO cards VALUES (4, 1, '{"name": "Vacuum", "tags": ["Clean", "Bedroom", "Office"], "finished": false}', 'bar/foo/123');
  INSERT INTO cards VALUES (5, 1, '{"name": "Hang paintings", "tags": ["Improvements", "Office"], "finished": false}', 'bar/foo');
  `);

  const res = await client.query(`
    SELECT * from cards
    WHERE path ~ '^/foo'
  `);

  console.log('res', res);

  res.rows.forEach(row => {
    console.log('row', row);
  });

  console.log('-------------------------------------------');
  console.log('count', res.rowCount);

  // const res = await client.query(`SELECT * FROM cards WHERE data->>'finished' = 'true';`);

  // console.log('res', res);

  await client.end();
})();
