import { expect, rx } from '../../test';
import { t } from './common';
import { Shell } from '.';

const bus = rx.bus();
const data = (shell: t.ShellModule): t.ShellData => shell.state.props?.data;

describe.only('Shell (Module)', () => {
  it('create', () => {
    const module = Shell.module(bus);
    expect(module.id).to.match(/.{20,}\:.{7}\.shell$/);
    expect(data(module).name).to.eql('');
  });
});
