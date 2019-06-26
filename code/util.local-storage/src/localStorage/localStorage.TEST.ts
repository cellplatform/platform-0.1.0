import { expect } from 'chai';
import { localStorage } from '.';
import * as t from '../types';

export type IMyObject = {
  count: number;
  width: number;
  message: string;
  obj: { force?: boolean } | undefined;
};
const config = {
  count: { default: 0, key: 'KEY/count' },
  width: { default: 350, key: 'KEY/width' },
  message: 'KEY/message',
  obj: { default: { force: true } },
};
const initial = {
  'KEY/count': 123,
  'KEY/message': 'hello',
};

/**
 * [NOTE] An injected provider allows testing on server, whereas the
 *        `localStorage` really only exists in the browser.
 */
const testProvider = (initial?: t.IJsonMap) => {
  const data = initial ? { ...initial } : {};
  const provider: t.ILocalStorageProvider = {
    type: 'TEST',
    get(key: string) {
      return data[key];
    },
    set(key, value) {
      data[key] = value;
      return value;
    },
    delete(key) {
      delete data[key];
    },
  };
  return provider;
};

describe('localStorage', () => {
  it('gets initial values', () => {
    const provider = testProvider(initial);
    const local = localStorage<IMyObject>(config, { provider });

    expect(local.count).to.eql(123);
    expect(local.width).to.eql(350);
    expect(local.message).to.eql('hello');
    expect(local.obj).to.eql({ force: true });
  });

  it('writes values', () => {
    const provider = testProvider(initial);
    const local = localStorage<IMyObject>(config, { provider });

    local.count = 888;
    local.width = 0;
    local.message = 'foo';

    expect(local.count).to.eql(888);
    expect(local.width).to.eql(0);
    expect(local.message).to.eql('foo');
  });

  it('deletes values', () => {
    const provider = testProvider(initial);
    const local = localStorage<IMyObject>(config, { provider });

    local.count = 888;
    local.message = 'foo';

    expect(local.count).to.eql(888);
    expect(local.message).to.eql('foo');

    local.delete('count');
    local.delete('message');
    expect(local.count).to.eql(0);
    expect(local.message).to.eql(undefined);
  });

  it('applies common key prefix', () => {
    const provider = testProvider({
      'FOO/count': 123,
      'FOO/message': 'hello',
    });
    const local = localStorage<IMyObject>(
      {
        message: { default: '' },
        count: { default: 0 },
        width: { default: 350 },
        obj: { default: { force: true } },
      },
      { provider, prefix: 'FOO/' },
    );

    expect(local.count).to.eql(123);
    expect(local.message).to.eql('hello');
    expect(local.obj).to.eql({ force: true });
  });

  it('fires events', () => {
    const events = {
      all: [] as t.LocalStorageEvent[],
      get: [] as t.ILocalStorageGet[],
      set: [] as t.ILocalStorageSet[],
      delete: [] as t.ILocalStorageDelete[],
    };

    const provider = testProvider(initial);
    const local = localStorage<IMyObject>(config, { provider });

    local.$.events$.subscribe(e => events.all.push(e));
    local.$.get$.subscribe(e => events.get.push(e));
    local.$.set$.subscribe(e => events.set.push(e));
    local.$.delete$.subscribe(e => events.delete.push(e));

    expect(local.count).to.eql(123);
    local.count = 456;
    local.delete('count');
    local.message = 'boo';
    local.obj = { force: false };

    expect(events.all.length).to.eql(5);
    expect(events.all[0].type).to.eql('LOCAL_STORAGE/get');
    expect(events.all[1].type).to.eql('LOCAL_STORAGE/set');
    expect(events.all[2].type).to.eql('LOCAL_STORAGE/delete');

    expect(events.get[0].key).to.eql('KEY/count');
    expect(events.get[0].prop).to.eql('count');
    expect(events.get[0].value).to.eql(123);

    expect(events.set[0].prop).to.eql('count');
    expect(events.set[0].key).to.eql('KEY/count');
    expect(events.set[0].value.from).to.eql(123);
    expect(events.set[0].value.to).to.eql(456);

    expect(events.delete[0].prop).to.eql('count');
    expect(events.delete[0].value).to.eql(456);

    expect(events.set[1].prop).to.eql('message');
    expect(events.set[1].key).to.eql('KEY/message');
    expect(events.set[1].value.from).to.eql('hello');
    expect(events.set[1].value.to).to.eql('boo');

    expect(events.set[2].prop).to.eql('obj');
    expect(events.set[2].key).to.eql('obj');
    expect(events.set[2].value.from).to.eql({ force: true });
    expect(events.set[2].value.to).to.eql({ force: false });
  });
});
