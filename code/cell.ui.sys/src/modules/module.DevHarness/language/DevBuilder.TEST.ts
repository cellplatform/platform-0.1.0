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

    it('kind: "harness.root"', () => {
      const dev = create(bus);
      expect(dev.module.root.props?.data?.kind).to.eql('harness.root');
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
    it('id', () => {
      const dev = create(bus);
      const component = dev.component('Foo');
      const children = dev.module.root.children || [];
      expect(component.id).to.eql(children[0].id);
      expect(component.props.id).to.eql(component.id);
    });

    it('kind: "harness.component"', () => {
      const dev = create(bus);
      dev.component('Foo');
      const children = dev.module.root.children || [];
      expect(children[0].props?.data?.kind).to.eql('harness.component');
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

    describe('property methods', () => {
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

      describe('background', () => {
        it('string | number', () => {
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

        it('function: color constants', () => {
          const dev = create(bus).component('Foo');
          const bg = () => dev.props.layout.background;

          dev.background((col) => col.RED());
          expect(bg()).to.eql('rgb(100%, 0%, 0%)');

          dev.background((col) => col.RED().RED(0.3));
          expect(bg()).to.eql('rgba(100%, 0%, 0%, 0.3)');

          dev.background((col) => col.opacity(0.1));
          expect(bg()).to.eql('rgba(100%, 0%, 0%, 0.1)'); // NB: Default red

          dev.background((col) => col.BLACK().opacity(0.1));
          expect(bg()).to.eql('rgba(0%, 0%, 0%, 0.1)');
        });

        it('function: set', () => {
          const dev = create(bus).component('Foo');
          const bg = () => dev.props.layout.background;

          // Hex.
          dev.background((col) => col.color('ED3C6E'));
          expect(bg()).to.eql('rgb(93%, 24%, 43%)');

          // Black (number).
          dev.background((col) => col.color(-1));
          expect(bg()).to.eql('rgb(0%, 0%, 0%)');

          dev.background((col) => col.color(-99));
          expect(bg()).to.eql('rgb(0%, 0%, 0%)');

          // White (number).
          dev.background((col) => col.color(1));
          expect(bg()).to.eql('rgb(100%, 100%, 100%)');

          dev.background((col) => col.color(99));
          expect(bg()).to.eql('rgb(100%, 100%, 100%)');

          // Alpha.
          dev.background((col) => col.color(-1).opacity(0.2));
          expect(bg()).to.eql('rgba(0%, 0%, 0%, 0.2)');
        });
      });

      describe('border', () => {
        it('boolean', () => {
          const dev = create(bus).component('Foo');
          expect(dev.props.layout.border).to.eql(undefined);

          dev.border(true);
          expect(dev.props.layout.border).to.eql(true);

          dev.border(false);
          expect(dev.props.layout.border).to.eql(false);
        });

        it('number (opacity)', () => {
          const dev = create(bus).component('Foo');
          expect(dev.props.layout.border).to.eql(undefined);

          dev.border(50);
          expect(dev.props.layout.border).to.eql(1);

          dev.border(-50);
          expect(dev.props.layout.border).to.eql(-1);
        });

        it('function: color', () => {
          const dev = create(bus).component('Foo');
          expect(dev.props.layout.border).to.eql(undefined);

          dev.border((e) => e.RED(0.1));
          expect(dev.props.layout.border).to.eql('rgba(100%, 0%, 0%, 0.1)');
        });
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
  });

  describe('DevBuilder.Folder', () => {
    it('id', () => {
      const dev = create(bus);
      const folder = dev.folder('Foo');
      const children = dev.module.root.children || [];
      expect(folder.id).to.eql(children[0].id);
      expect(folder.props.id).to.eql(folder.id);
      expect(folder.props.folder.name).to.eql('Foo');
    });

    it('kind: "harness.component"', () => {
      const dev = create(bus);
      dev.folder('Foo');
      const children = dev.module.root.children || [];
      expect(children[0].props?.data?.kind).to.eql('harness.folder');
    });

    describe('child: folder', () => {
      it('inserts within tree (inline twisty)', () => {
        const dev = create(bus);
        const parent = dev.folder('Foo');
        const child = parent.folder('MyChild');
        const node = dev.module.query.findById(child.id);
        expect(node?.props?.treeview?.label).to.eql('MyChild');
      });

      it('retrieves existing child component (by name)', () => {
        const dev = create(bus);
        const parent = dev.folder('Foo');
        const child1 = parent.folder('MyChild');
        const child2 = parent.folder('MyChild');
        expect(child1).to.equal(child2); // NB: same instance.
      });
    });

    describe('child: component', () => {
      it('inserts child component (within tree)', () => {
        const dev = create(bus);
        const parent = dev.folder('Folder');
        const child = parent.component('Foo');

        const node = dev.module.query.findById(child.id);
        expect(node?.props?.data?.kind).to.eql('harness.component');
      });

      it('retrieves existing child component (by name)', () => {
        const dev = create(bus);
        const parent = dev.folder('Foo');
        const child1 = parent.component('MyChild');
        const child2 = parent.component('MyChild');
        expect(child1).to.equal(child2); // NB: same instance.
      });
    });

    describe('property methods', () => {
      describe('name', () => {
        it('name', () => {
          const dev = create(bus);
          const dir = dev.folder('  Foo  ');
          expect(dir.props.folder.name).to.eql('Foo');
        });

        it('change (modifies treeview)', () => {
          const dev = create(bus);
          const dir = dev.folder('  Foo  ');

          dir.name('bear').name(' cat ');
          expect(dir.props.folder.name).to.eql('cat');

          const children = dev.module.root.children || [];
          expect(children[0].props?.treeview?.label).to.eql('cat');
        });
      });
    });
  });
});
