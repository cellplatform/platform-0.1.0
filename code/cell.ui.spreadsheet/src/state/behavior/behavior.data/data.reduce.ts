import { t } from '../../../common';

export function init(args: { store: t.IAppStore }) {
  const { store } = args;

  /**
   * REDUCE: Update tree state.
   */
  store.on<t.ISpreadsheetNsEvent>('APP:SHEET/ns').subscribe((e) => {
    e.change((state) => {
      state.ns = e.payload.ns;
      state.host = e.payload.host;
    });
  });

  /**
   * REDUCE: Load spreadsheet data (complete).
   */
  store.on<t.ISpreadsheetDataEvent>('APP:SHEET/data').subscribe((e) => {
    e.change((state) => {
      state.data = e.payload.data;
    });
  });

  /**
   * REDUCE: Patch spreadsheet data.
   */
  store.on<t.ISpreadsheetPatchEvent>('APP:SHEET/patch').subscribe((e) => {
    e.change((state) => {
      if (state.data) {
        const data = state.data;
        const { cells, rows, columns } = e.payload;
        if (cells) {
          state.data.cells = { ...data.cells, ...cells };
        }
        if (rows) {
          state.data.rows = { ...data.rows, ...rows };
        }
        if (columns) {
          state.data.columns = { ...data.columns, ...columns };
        }
      }
    });
  });
}
