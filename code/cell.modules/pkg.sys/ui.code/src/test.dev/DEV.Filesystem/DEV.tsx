import { Observable, Subject, BehaviorSubject, firstValueFrom, timeout, of } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';
import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { rx, t, IpcBus, Filesystem } from '../common';
import { CodeEditor } from '../../api';
import { Sample, SampleProps } from './Sample';

type E = t.CodeEditorEvent;
type Ctx = {
  bus: t.EventBus<E>;
  netbus: t.NetworkBus<E>;
  fs: t.Fs;
  props: SampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sample/CodeFilesystem')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<E>();
    const netbus = IpcBus<E>();

    const id = 'main';
    const store = Filesystem.Events({ id, bus: netbus });
    const fs = store.fs();

    const codeEvents = CodeEditor.events(bus);

    const $ = codeEvents.instance$;

    // codeEvents.instance$.subscribe((e) => {
    //   console.log('e', e);
    // });

    rx.payload<t.CodeEditorTextChangedEvent>($, 'CodeEditor/changed:text')
      .pipe()
      .subscribe(async (e) => {
        console.log('echanged', e);
        const change = e.changes[0].text;

        const data = new TextEncoder().encode(change);
        await fs.write('code.txt', data);
      });

    // bus.$.pipe(debounceTime(300)).subscribe((e) => {
    //   console.log('code/e:', e);

    // });

    // const $ = bus.$
    // rx.payload<>()

    const ctx: Ctx = {
      bus,
      netbus,
      fs,
      props: { bus },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.button('write textfile', async (e) => {
      const fs = e.ctx.fs;

      const data = new TextEncoder().encode('Hello Code File');
      await fs.write('code.txt', data);

      const manifest = await fs.manifest({ cache: 'remove' });
      console.log('manifest', manifest);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: 'sys.ui.code.Filesystem',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
