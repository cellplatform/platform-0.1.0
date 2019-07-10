import * as pg from 'pg';

(async () => {
  const client = new pg.Client({
    user: 'phil',
    host: 'localhost',
    database: 'fs',
  });

  await client.connect();

  // const res = await client.query(`CREATE TABLE IF NOT EXISTS tbl_Test (Rno INT)`);
  await client.query(`
   CREATE TABLE IF NOT EXISTS cards (
     id integer NOT NULL,
     board_id integer NOT NULL,
     data jsonb
   )
  `);

  // await client.query(`
  // INSERT INTO cards VALUES (1, 1, '{"name": "Paint house", "tags": ["Improvements", "Office"], "finished": true}');
  // INSERT INTO cards VALUES (2, 1, '{"name": "Wash dishes", "tags": ["Clean", "Kitchen"], "finished": false}');
  // INSERT INTO cards VALUES (3, 1, '{"name": "Cook lunch", "tags": ["Cook", "Kitchen", "Tacos"], "ingredients": ["Tortillas", "Guacamole"], "finished": false}');
  // INSERT INTO cards VALUES (4, 1, '{"name": "Vacuum", "tags": ["Clean", "Bedroom", "Office"], "finished": false}');
  // INSERT INTO cards VALUES (5, 1, '{"name": "Hang paintings", "tags": ["Improvements", "Office"], "finished": false}');
  // `);

  const res = await client.query(`SELECT * FROM cards WHERE data->>'finished' = 'true';`);

  console.log('res', res);

  await client.end();
})();
