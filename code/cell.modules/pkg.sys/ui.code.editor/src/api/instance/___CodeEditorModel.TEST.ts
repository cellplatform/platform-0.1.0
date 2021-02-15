import { t, expect, DEFAULT } from '../../test';
import { CodeEditorModel } from '.';

describe.skip('CodeEditorModel', () => {
  it('create: default', () => {
    const model = CodeEditorModel.create();
    expect(model.state).to.eql(DEFAULT.MODEL);
  });

  it('create: provided {initial}', () => {
    const selection = DEFAULT.MODEL.selection;
    const initial: t.CodeEditorModel = { filename: 'foo.tx', text: '// hello', selection };
    const model = CodeEditorModel.create(initial);
    expect(model.state).to.eql(initial);
  });
});
