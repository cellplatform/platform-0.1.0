import { Subject } from 'rxjs';

import { expect, rx, t } from '../../../test';
import { DevBuilder } from '.';

const create = DevBuilder.create;

const event$ = new Subject<t.Event>();
const bus = rx.bus(event$);

describe('Dev (API)', () => {
  describe('Dev', () => {
    it('create', () => {
      const dev = create(bus);
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

  describe('DevComponent', () => {
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
        expect(res1).to.equal(res2);

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

    it('cropMarks', () => {
      const dev = create(bus).component('Foo');
      expect(dev.props.layout.cropMarks).to.eql(undefined);

      dev.cropMarks(true);
      expect(dev.props.layout.cropMarks).to.eql(true);

      dev.cropMarks(false);
      expect(dev.props.layout.cropMarks).to.eql(false);

      dev.cropMarks(50);
      expect(dev.props.layout.cropMarks).to.eql(1);

      dev.cropMarks(-50);
      expect(dev.props.layout.cropMarks).to.eql(-1);
    });

    describe('position.absolute', () => {
      it('top/right/bottom/left', () => {
        const dev = create(bus).component('Foo');
        expect(dev.props.layout.position?.absolute?.top).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.right).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.bottom).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.left).to.eql(undefined);

        dev.position((pos) => pos.absolute.top(10).right(20).bottom(30).left(40));

        expect(dev.props.layout.position?.absolute?.top).to.eql(10);
        expect(dev.props.layout.position?.absolute?.right).to.eql(20);
        expect(dev.props.layout.position?.absolute?.bottom).to.eql(30);
        expect(dev.props.layout.position?.absolute?.left).to.eql(40);

        dev.position((pos) => pos.absolute.every(100));

        expect(dev.props.layout.position?.absolute?.top).to.eql(100);
        expect(dev.props.layout.position?.absolute?.right).to.eql(100);
        expect(dev.props.layout.position?.absolute?.bottom).to.eql(100);
        expect(dev.props.layout.position?.absolute?.left).to.eql(100);

        dev.position((pos) => pos.absolute.every(undefined));

        expect(dev.props.layout.position?.absolute?.top).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.right).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.bottom).to.eql(undefined);
        expect(dev.props.layout.position?.absolute?.left).to.eql(undefined);
      });
    });
  });
});
