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

    expect(res1).to.eql(el);
    expect(await loader.render('bar')).to.eql(undefined);
  });

  it('renders only once (cached)', async () => {
    const loader = Loader.create().add('foo', async () => <Foo />);
    const res1 = await loader.render('foo');
    const res2 = await loader.render('foo');
    expect(res1).to.equal(res2);
  });

  it('isLoaded', async () => {
    const el = <Foo />;
    const loader = Loader.create();
    expect(loader.isLoaded('foo')).to.eql(false);

    loader.add('foo', async () => el);
    expect(loader.isLoaded('foo')).to.eql(false);

    const res1 = loader.get('foo');
    expect(res1 && res1.isLoaded).to.eql(false);

    await loader.render('foo');
    const res2 = loader.get('foo');
    expect(res2 && res2.isLoaded).to.eql(true);
    expect(loader.isLoaded('foo')).to.eql(true);
  });

  it('loaded event', async () => {
    const el = <Foo />;
    const loader = Loader.create().add('foo', async () => el);

    const events: t.IModuleLoadedEvent[] = [];
    loader.events$.subscribe(e => events.push(e as any));

    await loader.render('foo');
    await loader.render('foo');
    await loader.render('foo');

    expect(events.length).to.eql(1);
    expect(events[0].payload.el).to.eql(el);
    expect(events[0].payload.module.id).to.eql('foo');
    expect(events[0].payload.module.isLoaded).to.eql(true);
  });
});
