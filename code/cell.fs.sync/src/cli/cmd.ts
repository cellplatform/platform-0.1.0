import { log, t, fs, http, semver, Schema, Client, Value } from '../common';

import * as FormData from 'form-data';

const LOCAL = 'http://localhost:8080';
const CLOUD = 'https://dev.db.team';

const HOST = LOCAL;
// const HOST = CLOUD;

/**
 * TODO 🐷
 * - FormData in HTTP client
 * - break out `cell.http.client` as module
 * - cli.types module (share prompt)
 * - Refactor: Move generalized CLI builder stuff into `@platform/cli`
 * - Pass `prompt` to the CLI command when it's run: {args:{ prompt, options }}
 * - DELETE file (verb)
 * - POST file with dir in name,
 *      eg: http://localhost:8080/cell:foo!A1/files/foo.txt?dir=/child/thing
 *      or  http://localhost:8080/cell:foo!A1/files/mydir/child/thing/foo.txt
 */

/**
 * Synchronize a folder with the cloud.
 */

const ns = 'ck499h7u30000fwet3k7085t1';

export async function syncDir(args: { dir: string; dryRun: boolean }) {
  const { dryRun = false } = args;
  const dir = fs.resolve(args.dir);

  const client = Client.create(HOST);

  const urls = Schema.url(HOST);

  // console.log('dir', dir);
  log.info.gray(`HOST ${HOST}`);
  log.info();

  const filenames = await fs.readdir(dir);
  const files = filenames
    .filter(name => !name.startsWith('.'))
    .filter(name => name.endsWith('.png')); // TEMP 🐷
  const sorted = sortSemver(files);

  sorted.forEach((item, i) => {
    const url = toUrl(HOST, i, item.filename);
    // const url = urls.cell()
    log.info(log.gray('>'), url.toString());
  });

  // return;

  log.info();
  log.info(`Uploading...\n`);
  const wait = sorted.map(async (item, index) => {
    const path = fs.join(dir, item.filename);
    if (!dryRun) {
      await upload({ client, index, path });
    }
  });
  await Promise.all(wait);

  log.info();
  log.info(`${files.length} files`);
  if (dryRun) {
    log.info.gray('NOTE: Dry run...nothing uploaded.');
  }
  log.info();
}

const toUrl = (host: string, index: number, filename: string) => {
  const urls = Schema.url(host);
  const key = `A${index + 1}`;
  const url = urls.cell({ ns, key }).file.byName(filename);
  return url;
};

const upload = async (args: { client: t.IClient; index: number; path: string }) => {
  // const { client } = args;
  // const r = await client.

  console.log('args.path:', args.path);

  const key = `A${args.index + 1}`;
  const client = args.client.cell({ ns, key });

  console.log('client.toString()', client.toString());

  // const form = new FormData();
  const filename = fs.basename(args.path);
  const data = await fs.readFile(args.path);

  // Compare the file-hash of the file to determine if the upload is required.
  const info = await client.file.name(filename).info();
  let isDiff = true;
  if (info.body.exists) {
    const localhash = Value.hash.sha256(data);
    isDiff = info.body.data.props.filehash !== localhash;
  }

  // console.log('filehash', filehash);

  // const h = info.body.data.props.filehash;

  console.log('-------------------------------------------');
  console.log('isDiff', isDiff);
  // console.log(h);

  // form.append('file', data, {
  //   filename,
  //   contentType: 'application/octet-stream',
  // });

  // const url = toUrl(HOST, args.index, filename).toString();
  // const headers = form.getHeaders();
  // const res = await http.post(url, form, { headers });
  // const msg = `${res.status} ${log.gray(url)}`;

  // if (res.ok) {
  //   log.info.green(msg);
  // } else {
  //   log.info.yellow(msg);
  //   log.info.yellow(`  `, res.json);
  // }
};

type T = { filename: string; version: string };

export function sortSemver(list: string[]): T[] {
  const ext = '.png'; // TEMP 🐷

  const items = list.map(filename => {
    const name = filename.replace(new RegExp(`${ext}$`), '');
    const parts = name.split('.');
    const version = `${parts[0] || 0}.${parts[1] || 0}.${parts[2] || 0}`;
    const res: T = { filename, version };
    return res;
  });

  const sorted = semver.sort(items.map(item => item.version));
  return sorted
    .map(version => items.find(item => item.version === version))
    .filter(item => Boolean(item)) as T[];
}
