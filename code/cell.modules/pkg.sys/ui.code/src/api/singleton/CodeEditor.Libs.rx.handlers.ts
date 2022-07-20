import { Is, rx, t } from '../common';

/**
 * Handles global events
 */
export function CodeEditorLibsEventHandlers(
  bus: t.CodeEditorEventBus,
  singleton: t.ICodeEditorSingleton,
) {
  const fire = (e: t.CodeEditorSingletonEvent) => bus.fire(e);
  const $ = bus.$;
  const libs = singleton.libs;

  /**
   * Libs
   */
  rx.payload<t.CodeEditorLibsClearEvent>($, 'CodeEditor/libs:clear')
    .pipe()
    .subscribe((e) => libs.clear());

  rx.payload<t.CodeEditorLibsLoadEvent>($, 'CodeEditor/libs:load')
    .pipe()
    .subscribe(async (e) => {
      const { tx, url } = e;
      const res = await libs.fromNetwork(url);
      const files = res.map((item) => item.filename);
      fire({ type: 'CodeEditor/libs:loaded', payload: { tx, url, files } });
    });
}
