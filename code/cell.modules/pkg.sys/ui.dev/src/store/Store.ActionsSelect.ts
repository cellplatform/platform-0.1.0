import { t, Uri } from '../common';

/**
 * Read/Write function for storing the current selected
 * state of an <ActionsSelect> dropdown.
 *
 * Pass [undefined] to read.
 */
export const ActionsSelect = {
  /**
   * Browser's local-storage.
   */
  localStorage(args: { actions?: t.Actions[]; namespace?: string }): t.ActionsSelectStore {
    const { namespace = 'dev', actions = [] } = args;
    const field = `${namespace}:actions/selected`;
    const fn: t.ActionsSelectStore = async (value) => {
      if (value !== undefined) localStorage.setItem(field, value.toObject().namespace);
      return actions.find((a) => a.toObject().namespace === localStorage.getItem(field));
    };
    return fn;
  },

  /**
   * Browser's local-storage.
   */
  cell(args: { client: t.IHttpClient; uri: string; actions?: t.Actions[]; namespace?: string }) {
    const { actions = [], namespace = 'dev' } = args;
    const field = `${namespace}:actions/selected`;
    const uri = Uri.cell(args.uri);

    const fn: t.ActionsSelectStore = async (value) => {
      try {
        if (value === undefined) {
          const client = args.client.cell(uri);
          const props = (await client.info()).body.data.props || {};
          return actions.find((actions) => actions.toObject().namespace === props[field]);
        } else {
          const cell: t.ICellData = { props: { [field]: value.toObject().namespace } };
          await args.client.ns(uri).write({ cells: { A1: cell } });
          return value;
        }
      } catch (error) {
        const action = value === undefined ? 'read' : 'write';
        const err = `Failed to ${action} currently selected Actions. ${error.message}`;
        throw new Error(err);
      }
    };

    return fn;
  },
};
