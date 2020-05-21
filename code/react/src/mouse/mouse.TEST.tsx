/* eslint-disable */
import * as React from 'react';

import { expect } from 'chai';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mouse } from '.';

describe('mouse', () => {
  describe('events$', () => {
    it('fromProps', () => {
      // NB: Testing for typescript error on `takeUntil`.
      const props: mouse.IMouseEventProps = {};
      const events = mouse.fromProps(props);
      const unmounted$ = new Subject();
      events.events$.pipe(takeUntil(unmounted$));
    });

    it('<div>', () => {
      type P = { name?: string; onClick?: () => void };
      class Foo extends React.PureComponent<P> {
        private mouse: mouse.IMouseHandlers;

        constructor(props: P) {
          super(props);
          this.mouse = mouse.fromProps(props);
        }

        public render() {
          // NB: This ensure the types work on the spread (which is the purpose of this test).
          return <div {...this.mouse.events}>Hello</div>;
        }
      }

      const el = <Foo name={'mary'} />;
      expect(el.props).to.eql({ name: 'mary' }); // NB: Arbitrary assertion, not the point of the test.bw
    });
  });

  describe('handler', () => {
    it('single handler', () => {
      const res = mouse.handle({ type: 'CLICK', handlers: [(e) => true] });
      expect(res).to.be.an.instanceof(Function);
    });

    it('multiple handlers', () => {
      const res = mouse.handle({ type: 'CLICK', handlers: [(e) => true, (e) => false] });
      expect(res).to.be.an.instanceof(Function);
    });

    it('no handlers (undefined)', () => {
      const res = mouse.handle({ type: 'CLICK' });
      expect(res).to.eql(undefined);
    });
  });

  describe('handlers', () => {
    it('generic handler (for all mouse events)', () => {
      const res = mouse.handlers((e) => true);
      expect(res.isActive).to.eql(true);
      expect(res.events$).to.be.an.instanceof(Observable);
      expect(res.events.onClick).to.be.an.instanceof(Function);
      expect(res.events.onDoubleClick).to.be.an.instanceof(Function);
      expect(res.events.onMouseDown).to.be.an.instanceof(Function);
      expect(res.events.onMouseUp).to.be.an.instanceof(Function);
      expect(res.events.onMouseEnter).to.be.an.instanceof(Function);
      expect(res.events.onMouseLeave).to.be.an.instanceof(Function);
    });

    it('no handlers', () => {
      const res = mouse.handlers();
      expect(res.isActive).to.eql(false);
      expect(res.events$).to.be.an.instanceof(Observable);
      expect(res.events.onClick).to.eql(undefined);
      expect(res.events.onDoubleClick).to.eql(undefined);
      expect(res.events.onMouseDown).to.eql(undefined);
      expect(res.events.onMouseUp).to.eql(undefined);
      expect(res.events.onMouseEnter).to.eql(undefined);
      expect(res.events.onMouseLeave).to.eql(undefined);
    });

    it('no generic handler, one specific handler (all handlers returned)', () => {
      const res = mouse.handlers(undefined, {
        onMouseEnter: (e) => true,
        onMouseLeave: (e) => true,
      });
      expect(res.isActive).to.eql(true);
      expect(res.events$).to.be.an.instanceof(Observable);
      expect(res.events.onClick).to.eql(undefined);
      expect(res.events.onDoubleClick).to.eql(undefined);
      expect(res.events.onMouseDown).to.eql(undefined);
      expect(res.events.onMouseUp).to.eql(undefined);
      expect(res.events.onMouseEnter).to.be.an.instanceof(Function);
      expect(res.events.onMouseLeave).to.be.an.instanceof(Function);
    });
  });
});
