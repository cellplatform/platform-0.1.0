import { expect } from 'chai';
import { storage } from '.';
import * as t from '../types';

export type IMyObject = { message: string; count: number };
const initial: IMyObject = { count: 123, message: 'hello' };

/**
 * [NOTE] An injected provider allows testing on server, whereas the
 *        `localStorage` really only exists in the browser.
 */
const testProvider = (initial?: t.IJsonMap) => {
  const data = initial ? { ...initial } : {};
  const provider: t.ILocalStorageProvider = {
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
    const localStorage = storage.localStorage<IMyObject>(initial, { provider });
    expect(localStorage.count).to.eql(123);
    expect(localStorage.message).to.eql('hello');
  });

  it('writes values', () => {
    const provider = testProvider(initial);
    const localStorage = storage.localStorage<IMyObject>(initial, { provider });

    localStorage.count = 888;
    localStorage.message = 'foo';

    expect(localStorage.count).to.eql(888);
    expect(localStorage.message).to.eql('foo');
  });

  it('deletes values', () => {
    const provider = testProvider(initial);
    const localStorage = storage.localStorage<IMyObject>(initial, { provider });

    localStorage.count = 888;
    localStorage.message = 'foo';

    expect(localStorage.count).to.eql(888);
    expect(localStorage.message).to.eql('foo');

    localStorage.delete('count');
    localStorage.delete('message');
    expect(localStorage.count).to.eql(123);
    expect(localStorage.message).to.eql('hello');
  });

  it('fires events', () => {
    const events = {
      all: [] as t.LocalStorageEvent[],
      get: [] as t.ILocalStorageGet[],
      set: [] as t.ILocalStorageSet[],
      delete: [] as t.ILocalStorageDelete[],
    };

    const provider = testProvider(initial);
    const localStorage = storage.localStorage<IMyObject>(initial, { provider });

    localStorage.$.events$.subscribe(e => events.all.push(e));
    localStorage.$.get$.subscribe(e => events.get.push(e));
    localStorage.$.set$.subscribe(e => events.set.push(e));
    localStorage.$.delete$.subscribe(e => events.delete.push(e));

    expect(localStorage.count).to.eql(123);
    localStorage.count = 456;
    localStorage.delete('count');

    expect(events.all.length).to.eql(3);
    expect(events.all[0].type).to.eql('LOCAL_STORAGE/get');
    expect(events.all[1].type).to.eql('LOCAL_STORAGE/set');
    expect(events.all[2].type).to.eql('LOCAL_STORAGE/delete');

    expect(events.get[0].key).to.eql('count');
    expect(events.get[0].value).to.eql(123);

    expect(events.set[0].key).to.eql('count');
    expect(events.set[0].value.from).to.eql(123);
    expect(events.set[0].value.to).to.eql(456);

    expect(events.delete[0].key).to.eql('count');
    expect(events.delete[0].value).to.eql(456);
  });
});
