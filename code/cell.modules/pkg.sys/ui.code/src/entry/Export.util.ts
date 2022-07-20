import { rx, t, log } from '../common';
import { CodeEditor } from '../api';

export const CommonEntry = {
  /**
   * Interpret an entry URL.
   */
  parseEntryUrl(href: string) {
    const url = new URL(href);
    const isLocalhost = url.hostname === 'localhost';

    const up = (path: string) => path.substring(0, path.lastIndexOf('/'));

    const path = url.pathname;
    if (['.json', '.js'].some((ext) => path.endsWith(ext))) url.pathname = up(url.pathname);

    return {
      url,
      staticRoot: isLocalhost ? undefined : `${url.origin}${url.pathname}`,
    };
  },

  /**
   * Common initialization from an incoming "entry" call.
   */
  init(bus: t.EventBus, ctx: t.ModuleDefaultEntryContext) {
    log.group('💦 ENTRY:');
    log.info('namespace', ctx.source.namespace);
    log.info(rx.bus.instance(bus));
    log.info('ctx.source', ctx.source);
    log.groupEnd();

    // Interpret incoming context.
    const href = ctx.source.url;
    const { url, staticRoot } = CommonEntry.parseEntryUrl(href);

    // Perform environment configuration based on the "source" module location details.
    CodeEditor.Configure.env({ staticRoot });

    // Finish up.
    return { url, staticRoot };
  },
};
