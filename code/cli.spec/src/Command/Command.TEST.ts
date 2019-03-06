import { expect } from 'chai';
import { Command } from '.';
import { DEFAULT } from './Command';

describe('Command', () => {
  it('minimal construction', () => {
    const cmd = Command.create({ name: '  Foo  ' });
    expect(cmd.name).to.eql('Foo'); // NB: trims title.
    expect(cmd.handler).to.eql(DEFAULT.HANDLER);
    expect(cmd.children).to.eql([]);
  });

  it('takes handler in constructor', () => {
    const handler = () => true;
    const cmd = Command.create({ name: 'Foo', handler });
    expect(cmd.handler).to.eql(handler);
  });

  it('takes children in constructor', () => {
    const child = Command.create({ name: 'child' });
    const parent = Command.create({ name: 'parent', children: [child] });
    expect(parent.children).to.eql([child]);
  });

  it('throws if a title is not passed', () => {
    const test = (name?: any) => {
      const fn = () => Command.create({ name, handler: () => null });
      expect(fn).to.throw();
    };
    test('');
    test('  ');
    test();
  });

  describe('clone', () => {
    it('clones - deep (default)', () => {
      const child = Command.create({ name: 'child' });
      const cmd1 = Command.create({ name: 'foo', children: [child] });
      const cmd2 = cmd1.clone();
      expect(cmd1).to.eql(cmd2);
      expect(cmd1).to.not.equal(cmd2);

      expect(cmd2.children).to.eql([child]);
      expect(cmd2.children[0]).to.not.equal(child);
    });

    it('clones - shallow (deep: false)', () => {
      const child = Command.create({ name: 'child' });
      const cmd1 = Command.create({ name: 'foo', children: [child] });
      const cmd2 = cmd1.clone({ deep: false });
      expect(cmd1).to.eql(cmd2);
      expect(cmd1).to.not.equal(cmd2);

      expect(cmd2.children).to.eql([child]);
      expect(cmd2.children[0]).to.equal(child);
    });
  });

  describe('describe (static)', () => {
    it('with args object', () => {
      const cmd = Command.create({ name: 'foo' });
      expect(cmd.name).to.eql('foo');
    });

    it('with title', () => {
      const handler = () => null;
      const cmd = Command.create('foo', handler);
      expect(cmd.name).to.eql('foo');
      expect(cmd.handler).to.eql(handler);
    });

    it('with title/handler', () => {
      const handler = () => null;
      const cmd = Command.create('foo', handler);
      expect(cmd.name).to.eql('foo');
      expect(cmd.handler).to.eql(handler);
    });
  });

  describe('add', () => {
    it('adds a child command', () => {
      const cmd1 = Command.create('foo');
      const cmd2 = cmd1.add('child');
      expect(cmd1).to.equal(cmd2);
      expect(cmd1.length).to.eql(1);
      expect(cmd2.children[0].name).to.eql('child');
    });

    it('adds a child to a child', () => {
      const cmd = Command.create('root')
        .add('a')
        .add('b')
        .add('c');

      expect(cmd.length).to.eql(3);
      expect(cmd.children[0].length).to.eql(0);

      const a1 = cmd.children[0].add('a1');
      expect(cmd.length).to.eql(3);
      expect(cmd.children[0].length).to.eql(1);
      expect(cmd.children[0]).to.equal(a1);
    });
  });

  describe('as<P,A>(...)', () => {
    it('adds child using different types', () => {
      type P = { text: string };
      type A = { force: boolean };
      type P1 = { name: string };
      type A1 = { suffix: string };

      const tmp = {
        suffix: '',
        force: false,
      };

      const root1 = Command.create<P, A>('root');

      const root2 = root1
        .as<P1, A1>(cmd =>
          cmd
            .add('foo', e => (tmp.suffix = e.args.options.suffix))
            .add('bar')
            .add('baz'),
        )
        .add('yo', e => (tmp.force = e.args.options.force));

      /**
       * NB: This tests the typing change for when adding within `as` context.
       *     The commands are added to the roots, but the typing is clean.
       *
       */
      expect(root1.length).to.eql(4);
      expect(root1).to.equal(root2);
    });
  });

  describe('toObject', () => {
    it('deep', () => {
      const myHandler = () => true;
      const cmd = Command.create('root', myHandler)
        .add('a', myHandler)
        .add('b', myHandler);
      cmd.children[1].add('b1', myHandler);

      const obj = cmd.toObject();

      expect(obj.name).to.eql('root');
      expect(obj.children[0].name).to.eql('a');
      expect(obj.children[1].name).to.eql('b');
      expect(obj.children[1].children[0].name).to.eql('b1');

      expect(obj.handler).to.eql(myHandler);
      expect(obj.children[0].handler).to.eql(myHandler);
      expect(obj.children[1].handler).to.eql(myHandler);
      expect(obj.children[1].children[0].handler).to.eql(myHandler);

      // NB: Function stripped from new object.
      const any: any = obj;
      expect(any.add).to.eql(undefined);
      expect(any.clone).to.eql(undefined);
      expect(any.children[0].add).to.eql(undefined);
      expect(any.children[0].clone).to.eql(undefined);
    });
  });
});
