import { t } from '../../common';

/**
 * Behavior controller.
 */
export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update error.
   */
  store
    .on<t.IIdeErrorEvent>('APP:IDE/error')
    .pipe()
    .subscribe((e) => {
      e.change((state) => {
        const error = e.payload;
        state.error = error;
      });
    });

  /**
   * REDUCE: Base URI.
   */
  store
    .on<t.IIdeUriEvent>('APP:IDE/uri')
    .pipe()
    .subscribe((e) => {
      e.change((state) => {
        state.uri = e.payload.uri;
      });
    });

  /**
   * REDUCE: Typesystem data.
   */
  store
    .on<t.IIdeTypeDataEvent>('APP:IDE/types/data')
    .pipe()
    .subscribe((e) => {
      e.change((state) => {
        const { ts, defs } = e.payload;
        state.typesystem = { defs, ts };
      });
    });

  /**
   * REDUCE: Unload typesystem data.
   */
  store
    .on<t.IIdeTypesClearEvent>('APP:IDE/types/clear')
    .pipe()
    .subscribe((e) => {
      e.change((state) => {
        state.typesystem = undefined;
      });
    });

  /**
   * REDUCE: Editor text
   */
  store
    .on<t.IIdeTextEvent>('APP:IDE/text')
    .pipe()
    .subscribe((e) => {
      e.change((state) => {
        state.text = e.payload.text;
      });
    });
}
