import { expect } from 'chai';
import { props } from '.';
import * as t from './types';

export type IMyObject = {
  message: string;
  count: number;
};

const initial: IMyObject = { count: 0, message: '' };

describe('props.observable', () => {
  describe('lifecycle', () => {
    it('constructs with keys from initial value', () => {
      const obj = props.observable<IMyObject>(initial);
      expect(obj.isDisposed).to.eql(false);
      expect(obj.count).to.eql(0);
      expect(obj.message).to.eql('');
    });

    it('constructs with no initial value', () => {
      const obj = props.observable<IMyObject>();
      expect(obj.count).to.eql(undefined);
      expect(obj.message).to.eql(undefined);
    });

    it('makes copy of initial object', () => {
      const initial: IMyObject = { count: 123, message: 'foo' };
      const obj = props.observable<IMyObject>(initial);

      expect(obj.count).to.eql(123);
      expect(obj.message).to.eql('foo');

      initial.count = 111;
      initial.message = 'mama';

      expect(obj.count).to.eql(123);
      expect(obj.message).to.eql('foo');
    });

    it('dispose', () => {
      const obj = props.observable<IMyObject>(initial);
      obj.dispose();
      expect(obj.isDisposed).to.eql(true);
    });
  });

  describe('get', () => {
    it('fires [get/getting] event with "modified" values', () => {
      const events = {
        getting: [] as t.IPropGetting[],
        get: [] as t.IPropGet[],
      };

      const obj = props.observable<IMyObject>(initial);

      obj.$.getting$.subscribe(e => {
        events.getting.push(e);
        switch (e.key) {
          case 'message':
            return e.modify('hello');
          case 'count':
            return e.modify(123);
        }
      });

      obj.$.get$.subscribe(e => {
        events.get.push(e);
      });

      expect(obj.message).to.eql('hello');
      expect(obj.count).to.eql(123);

      // BEFORE event.
      expect(events.getting.length).to.eql(2);
      expect(events.getting[0].value).to.eql('');
      expect(events.getting[1].value).to.eql(0);

      // AFTER event.
      expect(events.get.length).to.eql(2);
      expect(events.get[0].key).to.eql('message'); // NB: via `modify` method.
      expect(events.get[0].value).to.eql('hello'); // NB: via `modify` method.
      expect(events.get[1].key).to.eql('count');
      expect(events.get[1].value).to.eql(123);
    });
  });

  describe('set', () => {
    it('fires [set/setting] event and stores value', () => {
      const events = {
        setting: [] as t.IPropSetting[],
        set: [] as t.IPropSet[],
      };
      const obj = props.observable<IMyObject>(initial);

      obj.$.setting$.subscribe(e => events.setting.push(e));
      obj.$.set$.subscribe(e => events.set.push(e));

      expect(obj.message).to.eql('');
      expect(obj.count).to.eql(0);

      expect(events.setting.length).to.eql(0);
      expect(events.set.length).to.eql(0);

      obj.message = 'foo';
      obj.count = 888;

      // BEFORE event.
      expect(events.setting.length).to.eql(2);
      expect(events.setting[0].key).to.eql('message');
      expect(events.setting[0].value.from).to.eql('');
      expect(events.setting[0].value.to).to.eql('foo');
      expect(events.setting[0].isCancelled).to.eql(false);
      expect(events.setting[1].key).to.eql('count');
      expect(events.setting[1].value.from).to.eql(0);
      expect(events.setting[1].value.to).to.eql(888);
      expect(events.setting[1].isCancelled).to.eql(false);

      expect(events.set.length).to.eql(2);
      expect(events.set[0].key).to.eql('message');
      expect(events.set[0].value.from).to.eql('');
      expect(events.set[0].value.to).to.eql('foo');
      expect(events.set[1].key).to.eql('count');
      expect(events.set[1].value.from).to.eql(0);
      expect(events.set[1].value.to).to.eql(888);

      // Written values.
      expect(obj.message).to.eql('foo');
      expect(obj.count).to.eql(888);
    });

    it('cancels set operation', () => {
      const events = {
        setting: [] as t.IPropSetting[],
        set: [] as t.IPropSet[],
      };
      const obj = props.observable<IMyObject>(initial);

      obj.$.setting$.subscribe(e => {
        events.setting.push(e);
        e.cancel();
      });
      obj.$.set$.subscribe(e => events.set.push(e));

      obj.message = 'foo';

      expect(events.setting.length).to.eql(1);
      expect(events.set.length).to.eql(0);
      expect(events.setting[0].isCancelled).to.eql(true);
    });
  });
});
