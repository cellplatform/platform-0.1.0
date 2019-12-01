import { t, util } from '../common';

/**
 * Convert a model change list to [IDbModelChanges].
 */
export function toChanges(uri: string, changes: t.IModelChanges<any, any>): t.IDbModelChange[] {
  return changes.list.map(change => {
    const { field, value } = change;
    const { from, to } = value;
    return { uri, field, from, to };
  });
}

/**
 * Merges the given properties into the model's `props.props` object.
 * NOTE:
 *    This is a convenience method useful for model types that have
 *    a nested `.props` object on `model.props`.
 */
export function setProps<P extends object = {}>(model: t.IModel<M<P>>, props?: Partial<P>) {
  if (props) {
    model.set({
      props: util.squash.object({ ...(model.props.props || {}), ...props }) as P,
    });
  }
  return model;
}
type M<P extends object = {}> = { props?: P };
