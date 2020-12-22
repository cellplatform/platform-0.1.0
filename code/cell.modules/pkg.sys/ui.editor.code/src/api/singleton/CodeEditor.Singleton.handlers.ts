import { Is, rx, t } from '../../common';

/**
 * Handles global events
 */
export function SingletonChangeHandlers(
  bus: t.CodeEditorEventBus,
  singleton: t.ICodeEditorSingleton,
) {
  const $ = bus.event$;

  /**
   * Libs
   */
  rx.payload<t.ICodeEditorLibsClearEvent>($, 'CodeEditor/libs:clear')
    .pipe()
    .subscribe((e) => {
      singleton.libs.clear();
    });
}
