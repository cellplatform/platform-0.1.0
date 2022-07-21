import { Is, rx, t } from '../common';

/**
 * Handles global events
 */
export function CodeEditorLibsController(
  bus: t.CodeEditorEventBus,
  singleton: t.ICodeEditorSingleton,
) {
  const fire = (e: t.CodeEditorSingletonEvent) => bus.fire(e);
  const $ = bus.$;
  const libs = singleton.libs;

  /**
   * Libs
   */
  rx.payload<t.CodeEditorLibsClearReqEvent>($, 'sys.ui.code/libs/clear:req')
    .pipe()
    .subscribe((e) => {
      libs.clear();
    });

  rx.payload<t.CodeEditorLibsLoadReqEvent>($, 'sys.ui.code/libs/load:req')
    .pipe()
    .subscribe(async (e) => {
      const { tx, url } = e;
      const res = await libs.fromNetwork(url);
      const files = res.map((item) => item.filename);
      fire({
        type: 'sys.ui.code/libs/load:res',
        payload: { tx, url, files },
      });
    });
}
