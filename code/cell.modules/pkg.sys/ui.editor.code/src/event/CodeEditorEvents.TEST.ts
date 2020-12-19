import { expect, rx, t, is } from '../test';

import { CodeEditorEvents } from './CodeEditorEvents';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();

describe('CodeEditorEvents', () => {
  it('create', () => {
    const events = CodeEditorEvents(bus);
    expect(is.observable(events.$)).to.eql(true);
  });
});
