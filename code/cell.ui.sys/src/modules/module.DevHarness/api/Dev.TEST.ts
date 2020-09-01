import { Subject } from 'rxjs';

import { expect, rx, Module, t } from '../../../test';
import { Dev } from '.';

const event$ = new Subject<t.Event>();
const bus = rx.bus(event$);

describe('Dev (API)', () => {
  describe('Dev', () => {
    it('create', () => {
      const dev = Dev(bus);
      expect(dev.props.treeview?.label).to.eql('Untitled');
    });

    it('create: with label', () => {
      const dev = Dev(bus, 'Foo');
      expect(dev.props.treeview?.label).to.eql('Foo');
    });

    it('change: label', () => {
      const dev = Dev(bus);
      dev.label('Foo').label('Bar');
      expect(dev.props.treeview?.label).to.eql('Bar');
    });

    it('dispose', () => {
      const dev = Dev(bus);
      expect(dev.isDisposed).to.eql(false);
      expect(dev.module.isDisposed).to.eql(false);

      dev.dispose();
      expect(dev.isDisposed).to.eql(true);
      expect(dev.module.isDisposed).to.eql(true);
    });
  });

  describe('DevComponent', () => {
    describe('name', () => {
      it('name', () => {
        const dev = Dev(bus);
        const res = dev.component('  Foo  ');
        expect(res.props.component.name).to.eql('Foo');
      });

      it('retrieves existing component (by name)', () => {
        const dev = Dev(bus);
        const res1 = dev.component('Foo');
        const res2 = dev.component('  Foo  ');
        expect(res1).to.equal(res2);

        res2.name('Bar  ');
        const res3 = dev.component('  Bar');
        expect(res1).to.equal(res3);
      });

      it('throw: Invalid name (typename)', () => {
        const dev = Dev(bus);
        const expectThrow = (name: any) => {
          expect(() => dev.component(name)).to.throw(/Invalid component name/);
        };
        expectThrow('');
        expectThrow(' ');
        expectThrow('1Hello');
        expectThrow('harry');
        expectThrow('Foo Bar');
      });
    });

    it('label', () => {
      const dev = Dev(bus);
      const res = dev.component('Foo');
      expect(res.props.treeview?.label).to.eql('Foo'); // NB: Defaults to component "name".
      res.label('Bar').label('Baz');
      expect(res.props.treeview?.label).to.eql('Baz');
    });

    it('width', () => {
      const dev = Dev(bus);
      const res = dev.component('Foo');
      expect(res.props.layout?.width).to.eql(undefined);

      res.width(123);
      expect(res.props.layout.width).to.eql(123);

      res.width('80%');
      expect(res.props.layout.width).to.eql('80%');

      res.width(undefined);
      expect(res.props.layout.width).to.eql(undefined);
    });

    it('height', () => {
      const dev = Dev(bus);
      const res = dev.component('Foo');
      expect(res.props.layout.height).to.eql(undefined);

      res.height(123);
      expect(res.props.layout.height).to.eql(123);

      res.height('80%');
      expect(res.props.layout.height).to.eql('80%');

      res.height(undefined);
      expect(res.props.layout.height).to.eql(undefined);
    });
  });
});
