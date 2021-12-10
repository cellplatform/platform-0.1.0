import { t } from '../common';

type O = Record<string, unknown>;
type DocumentId = string;
type InstanceId = string;

/**
 * Event API: Single document.
 */
export function CrdtDocEvents<T extends O>(
  args: t.CrdtDocEventsArgs<T> & { events: t.CrdtEvents },
) {
  const { id } = args;

  const api: t.CrdtDocEvents<T> = {
    id,
    // get object() {
    //   // throw new Error('TODO: implement');
    //   return null as any as T;
    // },
  };

  return api;
}
