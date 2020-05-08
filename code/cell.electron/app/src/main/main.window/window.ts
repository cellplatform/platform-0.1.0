import { BrowserWindow, app } from 'electron';
import { constants, log, Schema, t, Uri } from '../common';

const PROCESS = constants.PROCESS;

/**
 *
 */
export async function createWindows(args: { kind: string; ctx: t.IAppCtx__OLD }) {
  const ctx = args.ctx;
  const defs = await ctx.windowDefs.data();
  const instances = await ctx.windows.data();

  const def = defs.rows.find(row => row.props.kind === args.kind);
  if (!def) {
    throw new Error(`A window-definition of kind '${args.kind}' could not be found.`);
  }

  const createInstance = async (def: t.ITypedSheetRowProps<t.SysAppWindowDef>) => {
    const index = instances.total;
    const instance = instances.row(index).props;
    instance.id = Schema.slug();
    instance.width = def.width;
    instance.height = def.height;
    instance.kind = def.kind;
  };

  if (def) {
    if (instances.total < 1) {
      // TEMP 🐷
      await createInstance(def.props);
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
 * Create an electron window for the given definition.
 */
export async function createWindow(args: {
  def: string | t.IRowUri;
  instance: string | t.IRowUri;
  ctx: t.IAppCtx__OLD;
}) {
  const ctx = args.ctx;
  const defUri = Uri.row(args.def);
  const instanceUri = Uri.row(args.instance);
  const host = ctx.host;

  const windows = await ctx.windows.data();
  const window = windows.rows.find(item => item.uri.toString() === instanceUri.toString());
  if (!window) {
    throw new Error(`Could not find [window] data-model '${instanceUri.toString()}'`);
  }

  const defs = await ctx.windowDefs.data();
  const def = defs.rows.find(row => row.props.kind === window.props.kind);
  if (!def) {
    throw new Error(`A window-definition of kind '${window.props.kind}' could not be found.`);
  }

  const isSandboxed = def.props.sandbox;

  // Create the browser window.
  // Docs: https://www.electronjs.org/docs/api/browser-window
  const props = window.props;
  const browser = new BrowserWindow({
    show: false,
    width: props.width,
    height: props.height,
    x: props.x < 0 ? undefined : props.x,
    y: props.y < 0 ? undefined : props.y,
    titleBarStyle: 'hiddenInset',
    backgroundColor: def.props.backgroundColor,
    webPreferences: {
      sandbox: isSandboxed,
      nodeIntegration: !isSandboxed,
      enableRemoteModule: false,
      preload: constants.paths.bundle.preload,
      additionalArguments: [
        constants.ENV.isDev ? PROCESS.DEV : '',
        `${PROCESS.HOST}=${ctx.host}`,
        `${PROCESS.WINDOW_URI}=${instanceUri.toString()}`,
      ],
    },
  });

  browser.on('resize', () => updateBounds());
  browser.on('move', () => updateBounds());

  const ref: t.IWindowRef = {
    uri: instanceUri.toString(),
    send: <T>(channel: string, payload: T) => browser.webContents.send(channel, payload),
  };

  browser.once('ready-to-show', () => {
    browser.setTitle(props.title);
    ctx.windowRefs = [...ctx.windowRefs, ref];

    browser.webContents.openDevTools(); // TEMP 🐷

    // browser.webContents.send()

    browser.show();
  });

  browser.once('closed', () => {
    ctx.windowRefs = ctx.windowRefs.filter(item => item.uri !== instanceUri.toString());
  });

  const updateBounds = () => {
    const { width, height, x, y } = browser.getBounds();
    props.width = width;
    props.height = height;
    props.x = x;
    props.y = y;
  };

  // Load window with content from URL.
  const urls = Schema.urls(host);
  const entryUrl = urls
    .cell(Uri.create.cell(defUri.ns, 'A1'))
    .file.byName('ui.sys/entry.html')
    .toString();
  const devUrl = constants.ENV.isDev ? 'http://localhost:1234' : '';
  const url = devUrl || entryUrl;
  browser.loadURL(url);

  // Finish up.
  logRenderer({
    host,
    instanceUri,
    instanceTypename: window.typename,
    entryUrl,
    devUrl,
    isSandboxed,
    ctx,
  });
}

/**
 * [Helpers]
 */

async function logRenderer(args: {
  host: string;
  instanceUri: string | t.IRowUri;
  instanceTypename: string;
  isSandboxed: boolean;
  entryUrl: string;
  devUrl?: string;
  ctx: t.IAppCtx__OLD;
}) {
  const { ctx } = args;
  const table = log.table({ border: false });
  const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);

  const host = args.host;
  const entryUrl = args.entryUrl
    .replace(/http:\/\//, '')
    .replace(/https:\/\//, '')
    .substring(host.length);

  const uri = args.instanceUri.toString();
  const windows = await ctx.windows.data();
  const window = windows.rows.find(window => window.uri.toString() === uri);

  add('kind:', log.magenta(window?.props.kind));
  add('sandbox:', `${args.isSandboxed} ${args.isSandboxed ? `(${log.white('secure')})` : ''}`);
  add('uri:', `${uri} (${log.white(args.instanceTypename)})`);
  add('host:', host);
  add('url:', entryUrl);
  if (args.devUrl) {
    add(log.gray(`url (dev):`), log.white(args.devUrl));
  }

  const output = `
${log.white('renderer')}
${table}
  `;
  log.info.gray(output);
}
