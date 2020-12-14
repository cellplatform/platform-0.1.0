import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Schema, t, value } from '../common';

export type FireUploadEvent = (args?: FireUploadEventArgs) => void;
export type FireUploadEventArgs = {
  file?: t.IHttpClientUploaded['file'];
  error?: t.IHttpErrorFile;
  done?: boolean;
};

/**
 * Helper for the Upload event observable.
 */
export function UploadEvent(args: { uri: string; total: number }) {
  const { uri, total } = args;
  const event$ = new Subject<t.IHttpClientUploadedEvent>();
  let completed = 0;
  const tx = Schema.cuid();

  const next = (payload: t.IHttpClientUploaded) => {
    payload = value.deleteUndefined(payload);
    event$.next({ type: 'HttpClient/uploaded', payload });
  };

  const fire: FireUploadEvent = (args = {}) => {
    const { file, error } = args;
    if (file && !error) {
      completed++;
    }
    const done = completed >= total ? true : args.done || false;
    next({ uri, tx, file, total, completed, done });
  };

  return {
    $: event$.pipe(share()),
    dispose: () => event$.complete(),
    fire,
  };
}
