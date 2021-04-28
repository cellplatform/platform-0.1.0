import { expect } from '../test';
import { Url } from '.';

describe('Url', () => {
  it('from object (Request)', () => {
    const url = Url({ url: '  http://localhost:1234  ' });
    expect(url.href).to.eql('http://localhost:1234/');
  });

  it('base parts', () => {
    const href = 'https://foo.com:8080/path?foo=123#hash';

    const url = Url(href);

    expect(url.toString()).to.eql(href);
    expect(url.href).to.eql(href);
    expect(url.host).to.eql('foo.com:8080');
    expect(url.hostname).to.eql('foo.com');
    expect(url.path).to.eql('/path');
  });

  it('protocol', () => {
    expect(Url('https://foo.com').protocol).to.eql('https');
    expect(Url('http://localhost').protocol).to.eql('http');
  });

  it('port', () => {
    expect(Url('https://foo.com').port).to.eql(80);
    expect(Url('https://foo.com:1234').port).to.eql(1234);
  });

  it('path', () => {
    expect(Url('https://foo.com').path).to.eql('/');
    expect(Url('https://foo.com/').path).to.eql('/');
    expect(Url('https://foo.com//').path).to.eql('//');
    expect(Url('  https://foo.com/foo  ').path).to.eql('/foo');
    expect(Url('https://foo.com/foo/bar/').path).to.eql('/foo/bar/');
  });

  it('hash', () => {
    expect(Url('https://foo.com/').hashstring).to.eql('');
    expect(Url('https://foo.com/#  ').hashstring).to.eql('');
    expect(Url('https://foo.com/#foo').hashstring).to.eql('foo');
    expect(Url('https://foo.com/path/#foo').hashstring).to.eql('foo');
    expect(Url('https://foo.com/path/?s=123#foo').hashstring).to.eql('foo');
  });

  it('querystring', () => {
    expect(Url('https://foo.com/ ').querystring).to.eql('');
    expect(Url('https://foo.com/? ').querystring).to.eql('');
    expect(Url('https://foo.com/?foo').querystring).to.eql('foo');
    expect(Url('https://foo.com/?foo=123 ').querystring).to.eql('foo=123');
    expect(Url('https://foo.com/?foo=123&bar ').querystring).to.eql('foo=123&bar');
  });

  it('query (object)', () => {
    expect(Url('https://foo.com/ ').query()).to.eql({});
    expect(Url('https://foo.com/?').query()).to.eql({});
    expect(Url('https://foo.com/path?foo=123').query()).to.eql({ foo: '123' });
    expect(Url('https://foo.com/path/?foo=123').query()).to.eql({ foo: '123' });
    expect(Url('https://foo.com/path/?foo=123&bar').query()).to.eql({ foo: '123', bar: true });
    expect(Url('http://localhost/?foo=1&foo=2&foo').query()).to.eql({ foo: ['1', '2', true] });

    type T = { foo: boolean };
    const res = Url('http://localhost?foo').query<T>();
    expect(res.foo).to.eql(true);
  });

  it('hash (object)', () => {
    expect(Url('https://foo.com/ ').hash()).to.eql({});
    expect(Url('https://foo.com/#').hash()).to.eql({});
    expect(Url('https://foo.com/path#foo=123').hash()).to.eql({ foo: '123' });
    expect(Url('https://foo.com/path/#foo=123').hash()).to.eql({ foo: '123' });
    expect(Url('https://foo.com/path/#foo=123&bar').hash()).to.eql({ foo: '123', bar: true });
    expect(Url('http://localhost/#foo=1&foo=2&foo').hash()).to.eql({ foo: ['1', '2', true] });

    type T = { foo: boolean };
    const res = Url('http://localhost#foo').hash<T>();
    expect(res.foo).to.eql(true);
  });
});
