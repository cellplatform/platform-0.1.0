import { Webpack } from '.';
import { expect, rx, t, constants } from '../test';

type E = t.WebpackEvent;

const bus = rx.bus<E>();
const props = (shell: t.WebpackModule) => shell.state.props as t.WebpackProps;
const data = (shell: t.WebpackModule) => props(shell).data as t.WebpackData;

describe('Webpack (Module)', () => {
  it('create', () => {
    const module = Webpack.module(bus);
    expect(module.id).to.match(/.{20,}\:.{7,10}\.webpack$/);
    expect(props(module).kind).to.eql('Module:Webpack');
    expect(data(module)).to.eql(constants.DEFAULT.DATA);
  });
});
