import * as React from 'react';

import { expect } from 'chai';
import { Loader } from './Loader';
import { t } from '../common';

const Foo = (props: {}) => <div />;

describe('Loader', () => {
  it('adds a module configurtion', () => {
    const loader = Loader.create();
    expect(loader.count).to.eql(0);

    const events: t.IModuleAddedEvent[] = [];
    loader.events$.subscribe(e => events.push(e as any));

    loader
      .add('foo', async () => <Foo />)
      .add('bar', async () => <Foo />)
      .add('baz', async () => <Foo />);

    expect(loader.count).to.eql(3);

    expect(events.length).to.eql(3);
    expect(events[0].payload.id).to.eql('foo');
    expect(events[1].payload.id).to.eql('bar');
    expect(events[2].payload.id).to.eql('baz');
  });

  it('get (by id)', () => {
    const loader = Loader.create().add('foo', async () => <Foo />);
    const res1 = loader.get('foo');
    const res2 = loader.get('bar');
    expect(res1 && res1.id).to.eql('foo');
    expect(res2).to.eql(undefined);
  });

  it('get (by index)', async () => {
    const loader = Loader.create()
      .add('foo', async () => <Foo />)
      .add('bar', async () => <Foo />);
    const res1 = loader.get(0);
    const res2 = loader.get(1);
    const res3 = loader.get(2);
    expect(res1 && res1.id).to.eql('foo');
    expect(res2 && res2.id).to.eql('bar');
    expect(res3).to.eql(undefined);
  });

  it('exists', () => {
    const loader = Loader.create().add('foo', async () => <Foo />);
    expect(loader.exists('foo')).to.eql(true);
    expect(loader.exists('bar')).to.eql(false);
  });

  it('throws if a module with the same ID is added more than once', () => {
    const fn = () => {
      Loader.create()
        .add('foo', async () => <Foo />)
        .add('foo', async () => <Foo />);
    };
    expect(fn).to.throw(/A module with the id 'foo' has already been added/);
  });

  it('render', async () => {
    const el = <Foo />;
    const loader = Loader.create().add('foo', async () => el);

    const res1 = await loader.render('foo');
    const res2 = await loader.render('bar');

    expect(res1).to.eql(el);
    expect(res2).to.eql(undefined);
  });
});
