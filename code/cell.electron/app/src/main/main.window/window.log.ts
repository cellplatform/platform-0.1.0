import { ENV, log, t } from '../common';
import { getUrl } from './window.url';

export async function logWindow(args: {
  ctx: t.IContext;
  app: t.ITypedSheetRow<t.App>;
  window: t.ITypedSheetRow<t.AppWindow>;
}) {
  const { ctx, app, window } = args;
  const table = log.table({ border: false });
  const add = (key: string, value: any) => table.add([` • ${log.green(key)} `, value]);

  const isSandboxed = true;
  const uri = log.gray(`${log.green('cell')}:${window.uri.ns}:${log.green(window.uri.key)}`);

  const host = ctx.host;
  const url = getUrl({ host, app });

  add('kind:', log.magenta(window.props.app));
  add('uri:', `${uri} (${log.white(window.typename)})`);
  add('sandbox:', isSandboxed);
  add('url:', url.entry);
  if (ENV.isDev) {
    add(log.gray(`url (dev):`), log.white(url.dev));
  }

  const output = `
${log.white('renderer')}
${table}
  `;
  log.info.gray(output);
}
