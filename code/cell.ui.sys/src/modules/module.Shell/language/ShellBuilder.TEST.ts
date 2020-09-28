import { expect, rx } from '../../../test';
import { t, Module } from '../common';
import { builder } from '.';
import { Shell } from '..';

const create = () => {
  const bus = rx.bus();
  const shell = Shell.module(bus);
  Module.register(bus, shell);
  const api = builder(bus);
  return { bus, api, shell };
};

const data = (shell: t.ShellModule): t.ShellData => shell.state.props?.data;

describe.only('ShellBuilder (DSL)', () => {
  describe('create', () => {
    it('throw: module not provided', () => {
      const fn = () => builder(rx.bus());
      expect(fn).to.throw(/A module of kind 'Shell' could not be found/);
    });

    it('create: uses given module', () => {
      const bus = rx.bus();
      const shell = Shell.module(bus);
      expect(data(shell)).to.eql(undefined);

      builder(bus, { shell }).name('foo');
      expect(data(shell).name).to.eql('foo');
    });

    it('create: retrieves existing module (lookup)', () => {
      const bus = rx.bus();
      const shell = Shell.module(bus);
      expect(data(shell)).to.eql(undefined);

      Module.register(bus, shell);
      const api = builder(bus);

      api.name('foo');
      expect(data(shell).name).to.eql('foo');
    });
  });

  describe('root', () => {
    it('name', () => {
      const { api, shell } = create();
      api.name('foo').name('bar');
      expect(data(shell).name).to.eql('bar');
    });
  });
});
