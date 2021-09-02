import React from 'react';
import { debounceTime } from 'rxjs/operators';
import { DevActions, Textbox } from 'sys.ui.dev';

import { CodeEditor } from '../../api';
import { Filesystem, IpcBus, rx, t } from '../common';
import { CodeEditor as CodeEditorView } from '../../components/CodeEditor';

type E = t.CodeEditorEvent;
type Ctx = {
  id: string;
  props: { filename: string };
  bus: t.EventBus<E>;
  netbus: t.NetworkBus<E>;
  events: t.CodeEditorInstanceEvents;
  fs: t.Fs;
  save(): Promise<void>;
  filename(value: string): void;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sample/CodeFilesystem')
  .context((e) => {
    if (e.prev) return e.prev;

    const id = 'foo';
    const bus = rx.bus<E>();
    const netbus = IpcBus<E>();
    const store = Filesystem.Events({ id: 'main', bus: netbus });
    const fs = store.fs();

    const save = async () => {
      const path = e.current?.props.filename;
      if (path) {
        const text = await events.text.get.fire();
        const data = new TextEncoder().encode(text);
        await fs.write(path, data);
      }
    };

    const events = CodeEditor.events(bus).editor(id);
    events.text.changed$.pipe(debounceTime(300)).subscribe(save);

    const ctx: Ctx = {
      id,
      props: { filename: 'test.ui.code/code.txt' },
      bus,
      netbus,
      fs,
      events,
      save,
      filename: (value) => e.change.ctx((draft) => (draft.props.filename = value)),
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.button('save', async (e) => {
      await e.ctx.save();
      e.ctx.events.action.fire('editor.action.formatDocument');
    });

    e.hr(1, 0.1);

    e.button('typescript', (e) => e.ctx.events.model.set.language('typescript'));
    e.button('json', (e) => e.ctx.events.model.set.language('json'));

    e.hr();
  })

  .subject((e) => {
    const { id, bus, props } = e.ctx;

    const txtFilename = (
      <Textbox
        placeholder={'filename'}
        value={e.ctx.props.filename}
        onChange={({ to }) => e.ctx.filename(to)}
      />
    );

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { topLeft: 'sys.ui.code.Filesystem', bottomLeft: txtFilename },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const { filename } = props;
    const el = <CodeEditorView bus={bus} id={id} filename={filename} />;

    e.render(el);
  });

export default actions;
