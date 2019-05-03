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
});
