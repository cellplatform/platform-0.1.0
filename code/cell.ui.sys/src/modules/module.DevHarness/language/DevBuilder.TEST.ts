import { Subject } from 'rxjs';

import { expect, rx } from '../../../test';
import { DevBuilder } from '.';
import * as t from '../types';

const create = DevBuilder.create;

const event$ = new Subject<t.Event>();
const bus = rx.bus(event$);

describe('Dev (DSL)', () => {
  describe('DevBuilder', () => {
    it('create', () => {
      const dev = create(bus);
      expect(dev.props.id).to.eql(dev.module.id);
      expect(dev.props.treeview?.label).to.eql('Untitled');
    });

    it('create: with label', () => {
      const dev = create(bus, 'Foo');
      expect(dev.props.treeview?.label).to.eql('Foo');
    });

    it('change: label', () => {
      const dev = create(bus);
      dev.label('Foo').label('Bar');
      expect(dev.props.treeview?.label).to.eql('Bar');
    });

    it('dispose', () => {
      const dev = create(bus);
      expect(dev.isDisposed).to.eql(false);
      expect(dev.module.isDisposed).to.eql(false);

      dev.dispose();
      expect(dev.isDisposed).to.eql(true);
      expect(dev.module.isDisposed).to.eql(true);
    });
  });

  describe('DevBuilder.Component', () => {
    describe('properties', () => {
      describe('name', () => {
        it('name', () => {
          const dev = create(bus);
          const res = dev.component('  Foo  ');
          expect(res.props.component.name).to.eql('Foo');
        });

        it('retrieves existing component (by name)', () => {
          const dev = create(bus);
          const res1 = dev.component('Foo');
          const res2 = dev.component('  Foo  ');
          expect(res1).to.equal(res2); // NB: same instance.

          res2.name('Bar  ');
          const res3 = dev.component('  Bar');
          expect(res1).to.equal(res3);
        });

        it('throw: Invalid name (typename)', () => {
          const dev = create(bus);
          const expectThrow = (name: any) => {
            expect(() => dev.component(name)).to.throw(/Invalid component name/);
          };
          expectThrow('');
          expectThrow(' ');
          expectThrow('1Hello');
          expectThrow('harry');
          expectThrow('foo-bar');
          expectThrow('foo.bar');
          expectThrow('Foo Bar');
        });
      });

      it('label', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.treeview?.label).to.eql('Foo'); // NB: Defaults to component "name".
        dev.label('Bar').label('Baz');
        expect(dev.props.treeview?.label).to.eql('Baz');
      });

      it('width', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout?.width).to.eql(undefined);

        dev.width(123);
        expect(dev.props.layout.width).to.eql(123);

        dev.width('80%');
        expect(dev.props.layout.width).to.eql('80%');

        dev.width(undefined);
        expect(dev.props.layout.width).to.eql(undefined);
      });

      it('height', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout.height).to.eql(undefined);

        dev.height(123);
        expect(dev.props.layout.height).to.eql(123);

        dev.height('80%');
        expect(dev.props.layout.height).to.eql('80%');

        dev.height(undefined);
        expect(dev.props.layout.height).to.eql(undefined);
      });

      it('background', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout.background).to.eql(undefined);

        dev.background(-50);
        expect(dev.props.layout.background).to.eql(-1);

        dev.background(50);
        expect(dev.props.layout.background).to.eql(1);

        dev.background(0);
        expect(dev.props.layout.background).to.eql(0);

        dev.background('  #fff  ');
        expect(dev.props.layout.background).to.eql('#fff');

        dev.background(undefined);
        expect(dev.props.layout.background).to.eql(undefined);
      });

      it('border', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout.border).to.eql(undefined);

        dev.border(true);
        expect(dev.props.layout.border).to.eql(true);

        dev.border(false);
        expect(dev.props.layout.border).to.eql(false);

        dev.border(50);
        expect(dev.props.layout.border).to.eql(1);

        dev.border(-50);
        expect(dev.props.layout.border).to.eql(-1);
      });

      it('cropmarks', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout.cropmarks).to.eql(undefined);

        dev.cropmarks(true);
        expect(dev.props.layout.cropmarks).to.eql(true);

        dev.cropmarks(false);
        expect(dev.props.layout.cropmarks).to.eql(false);

        dev.cropmarks(50);
        expect(dev.props.layout.cropmarks).to.eql(1);

        dev.cropmarks(-50);
        expect(dev.props.layout.cropmarks).to.eql(-1);
      });

      describe('position', () => {
        it('absolute: top/right/bottom/left', () => {
          const abs = () => {
            const obj = dev.props.layout.position?.absolute;
            return obj ? [obj.top, obj.right, obj.bottom, obj.left] : undefined;
          };

          const dev = create(bus).component('Foo');

          expect(abs()).to.eql(undefined);

          dev.position((pos) => pos.absolute.top(10).right(20).bottom(30).left(40));
          expect(abs()).to.eql([10, 20, 30, 40]);

          dev.position((pos) => pos.absolute.xy(100));
          expect(abs()).to.eql([100, 100, 100, 100]);

          dev.position((pos) => pos.absolute.xy(-10).top(123));
          expect(abs()).to.eql([123, -10, -10, -10]);

          dev.position((pos) => pos.absolute.xy(undefined));
          expect(abs()).to.eql(undefined);

          dev.position((pos) => pos.absolute.x(10));
          expect(abs()).to.eql([undefined, 10, undefined, 10]);

          dev.position((pos) => pos.absolute.y(20));
          expect(abs()).to.eql([20, 10, 20, 10]);

          dev.position((pos) => pos.absolute.xy(undefined).left(10));
          expect(abs()).to.eql([undefined, undefined, undefined, 10]);

          dev.position((pos) => pos.absolute.left(undefined));
          expect(abs()).to.eql(undefined);
        });
      });
    });

    describe('child', () => {
      it('inserts within tree (inline twisty)', () => {
        const dev = create(bus);
        const parent = dev.component('Foo');
        const child = parent.component('MyChild');
        const node = dev.module.query.findById(child.id);
        expect(node?.props?.treeview?.label).to.eql('MyChild');
      });

      it('retrieves existing child component (by name)', () => {
        const dev = create(bus);
        const parent = dev.component('Foo');
        const child1 = parent.component('MyChild');
        const child2 = parent.component('MyChild');
        expect(child1).to.equal(child2); // NB: same instance.
      });
    });
  });
});
