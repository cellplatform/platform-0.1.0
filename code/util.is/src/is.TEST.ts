import { expect } from './test';
import { Subject } from 'rxjs';
import { fs } from '@platform/fs';

import { is } from '.';

describe('Is', () => {
  it('is.test', () => {
    expect(is.nodeEnv).to.eql('test');
    expect(is.test).to.eql(true);
  });

  it('is.browser', () => {
    expect(is.browser).to.eql(false);
  });

  it('is.observable', () => {
    const test = (input: any, expected: boolean) => {
      expect(is.observable(input)).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test('hello', false);
    test(1223, false);
    test({}, false);

    test({ subscribe: () => null }, true);
    test(new Subject<void>(), true);
    test(new Subject<void>().asObservable(), true);
  });

  it('is.subject', () => {
    const test = (input: any, expected: boolean) => {
      expect(is.subject(input)).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test('hello', false);
    test(1223, false);
    test({}, false);

    test({ subscribe: () => null }, false);
    test({ subscribe: () => null, next: () => null }, true);

    test(new Subject<void>(), true);
    test(new Subject<void>().asObservable(), false);
  });

  it('is.stream', () => {
    const test = (input: any, expected: boolean) => {
      expect(is.stream(input)).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test('hello', false);
    test(1223, false);
    test({}, false);
    test(new Subject<void>(), false);

    const stream = fs.createReadStream(fs.resolve('./package.json'));
    test(stream, true);
  });

  it('is.promise', () => {
    const test = (input: any, expected: boolean) => {
      expect(is.promise(input)).to.eql(expected);
    };

    const wait = async () => null;

    test(undefined, false);
    test(123, false);
    test('hello', false);
    test(['hello', 123], false);
    test(true, false);
    test(null, false);
    test({}, false);

    test({ then: () => null }, true);
    test(wait(), true);

    //
  });
});
