import { ENV, log, t } from '../common';
import { getUrl } from './window.url';

export async function logWindow(args: {
  ctx: t.IContext;
  app: t.ITypedSheetRow<t.App>;
  window: t.ITypedSheetRow<t.AppWindow>;
  sandbox: boolean;
}) {
  const { ctx, app, window } = args;
  const table = log.table({ border: false });
  const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);

  const uri = log.format.uri(window.uri);

  const host = ctx.host;
  const url = await getUrl({ host, app });

  add('kind:', log.magenta(window.props.app));
  add('uri:', `${uri} (${log.white(window.typename)})`);
  add('sandbox:', args.sandbox);
  add('url:', url.entry);
  if (ENV.isDev) {
    const isRunning = url.dev.isRunning;
    const devUrl = isRunning ? log.white(url.dev) : url.dev;
    const running = isRunning ? '' : `(${log.yellow('not running')})`;
    add(log.gray(`url (dev):`), `${devUrl} ${running}`);
  }

  const output = `
${log.white('renderer')}
${table}
  `;
  log.info.gray(output);
}
