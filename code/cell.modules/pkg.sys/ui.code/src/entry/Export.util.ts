import { CodeEditor } from '../api';
import { log, ModuleUrl, rx, t, WebRuntime } from '../common';

export const CommonEntry = {
  /**
   * Interpret an entry URL.
   */
  parseEntryUrl(href: string) {
    const url = ModuleUrl.removeFilename(href);
    return {
      url,
      staticRoot: `${url.origin}${url.pathname}`,
    };
  },

  /**
   * Common initialization from an incoming "entry" call.
   */
  async init(pump: t.EventPump, ctx: t.ModuleDefaultEntryContext) {
    const bus = rx.bus();
    rx.pump.connect(pump).to(bus);

    // Interpret incoming context.
    const href = ctx.source.url;
    const { url, staticRoot } = CommonEntry.parseEntryUrl(href);
    const events = CodeEditor.start(bus);

    // Initialize the code-editor environment.
    const res = await events.init.fire({ staticRoot });
    const status = await events.status.get();
    const paths = status?.paths;
    const isDefault = staticRoot === undefined;

    log.group('💦 ENTRY (CodeEditor)');
    log.info('WebRuntime:', WebRuntime.Module.info);
    log.info('namespace:', ctx.source.namespace);
    log.info('event-pump:', pump.id);
    log.info('localbus:', rx.bus.instance(bus));
    log.info('ctx.source:', ctx.source);
    log.info(`paths${isDefault ? ' (defaults):' : ':'}`.trim(), paths);
    if (res.error) log.info(`error:`, res.error);
    log.info('💦');
    log.info('💦 (async response)');
    log.groupEnd();

    // Finish up.
    return { bus, url, staticRoot };
  },
};
