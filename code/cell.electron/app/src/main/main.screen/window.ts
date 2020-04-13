import { BrowserWindow } from 'electron';
import { constants, log, Schema, t, Uri } from '../common';
import { client } from '../main.client';

const SYS = constants.SYS;

/**
 *
 */
export async function createWindows(args: { defName: string; ctx: t.IAppCtx }) {
  const ctx = await client.getOrCreateSys(args.ctx.host); // 🐷 HACK: this should have updated internally (data caching issue).
  const defs = await ctx.windowDefs.cursor();
  const instances = await ctx.windows.cursor();
  const def = defs.rows.find(r => r.props.kind === args.defName);

  if (!def) {
    throw new Error(`A window definition named '${args.defName}' could not be found.`);
  }

  const create = async (def: t.ITypedSheetRowProps<t.CellAppWindowDef>) => {
    const index = instances.total;
    const instance = instances.row(index).props;
    instance.id = Schema.slug();
    instance.width = def.width;
    instance.height = def.height;
    instance.kind = def.kind;
    await ctx.flush();
  };

  if (def) {
    if (instances.total === 0) {
      await create(def.props);
    }

    instances.rows.forEach(instance => {
      createWindow({
        ctx,
        def: def.uri,
        instance: instance.uri,
      });
    });
  }
}

/**
 *
 */
export async function createWindow(args: {
  def: string | t.IRowUri;
  instance: string | t.IRowUri;
  ctx: t.IAppCtx;
}) {
  const toRow = (input: string | t.IRowUri) =>
    typeof input === 'string' ? Uri.parse<t.IRowUri>(input).parts : input;

  const def = toRow(args.def);
  const instance = toRow(args.instance);

  const ctx = await client.getOrCreateSys(args.ctx.host); // 🐷 HACK: this should have updated internally (data caching issue).
  const host = ctx.host;

  const windows = await ctx.windows.cursor();
  const window = windows.rows.find(w => w.uri.toString() === instance.toString());
  if (!window) {
    throw new Error(`Could not find window model '${instance.toString()}'`);
  }

  // Create the browser window.
  const props = window.props;
  const browser = new BrowserWindow({
    width: props.width,
    height: props.height,
    x: props.x < 0 ? undefined : props.x,
    y: props.y < 0 ? undefined : props.y,
    show: false,
    webPreferences: { nodeIntegration: true },
  });

  const urls = Schema.urls(host);
  const entryUrl = urls
    .cell(Uri.create.cell(def.ns, 'A1'))
    .file.byName('entry.html')
    .toString();

  const devUrl = constants.ENV.isDev ? 'http://localhost:1234' : '';
  const url = devUrl || entryUrl;

  const query: t.IEnvLoaderQuery = { host, def: def.toString(), instance: instance.toString() };
  const querystring = Object.keys(query)
    .reduce((acc, key) => `${acc}&${key}=${query[key]}`, '')
    .replace(/^\&/, '');

  // Construct window.
  browser.loadURL(`${url}?${querystring}`);
  browser.webContents.openDevTools(); // TEMP 🐷

  const updateBounds = () => {
    const { width, height, x, y } = browser.getBounds();
    props.width = width;
    props.height = height;
    props.x = x;
    props.y = y;
  };

  browser.on('resize', () => updateBounds());
  browser.on('move', () => updateBounds());

  browser.once('ready-to-show', () => {
    browser.setTitle(props.title);
    browser.show();
  });

  // Finish up.
  logWindow({ query, entryUrl, devUrl });
}

/**
 * [Helpers]
 */

function logWindow(args: { query: t.IEnvLoaderQuery; entryUrl: string; devUrl?: string }) {
  const table = log.table({ border: false });
  const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);

  add('instance:', args.query.instance);
  add('def:', args.query.def);
  add('url:', args.entryUrl);
  if (args.devUrl) {
    add(log.gray(`url (dev):`), log.white(args.devUrl));
  }

  const output = `
${log.white('window')}
${table}
  `;
  log.info.gray(output);
}
