import { expect } from 'chai';
import { Command } from '.';
import { CommandParam } from '../CommandParam';

describe('Command', () => {
  describe('construction', () => {
    it('minimal construction', () => {
      const cmd = Command.create('  Foo  ');
      expect(cmd.name).to.eql('Foo'); // NB: trims title.
      expect(cmd.description).to.eql('');
      expect(cmd.handler).to.be.an.instanceof(Function);
      expect(cmd.children).to.eql([]);
      expect(cmd.params).to.eql([]);
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

    it('takes params in constructor', () => {
      const cmd = Command.create({
        name: 'child',
        params: [
          { name: 'foo', type: 'string' },
          { name: 'bar', type: [1, 2, 3] },
        ],
      });
      const params = cmd.params;
      expect(params.length).to.eql(2);
      expect(params[0]).to.be.an.instanceof(CommandParam);
      expect(params[1]).to.be.an.instanceof(CommandParam);
      expect(params[0].name).to.eql('foo');
      expect(params[1].name).to.eql('bar');
      expect(params[0].type).to.eql('string');
      expect(params[1].type).to.eql([1, 2, 3]);
    });

    it('throws if a name is not passed', () => {
      const test = (name?: any) => {
        const fn = () => Command.create({ name, handler: () => null });
        expect(fn).to.throw();
      };
      test('');
      test('  ');
      test();
    });

    it('generates id from name', () => {
      const cmd1 = Command.create({ name: '  foo  ' });
      const cmd2 = Command.create({ name: 'foo' }); // NB: Same as trimmed name above.
      const cmd3 = Command.create({ name: 'fOo' });
      expect(cmd1.id).to.eql(101574);
      expect(cmd2.id).to.eql(101574);
      expect(cmd3.id).to.eql(100582); // Different (capital "O" in "fOo").
    });
  });

  describe('Command.toId (static)', () => {
    it('name only', () => {
      const id = Command.toId({ name: 'foo' });
      expect(id).to.eql(101574);
    });

    it('name with parentId', () => {
      const parent = Command.toId({ name: 'root' });
      const id = Command.toId({ name: 'foo', parent });
      expect(id).to.eql(-63661183);
    });
  });

  describe('clone', () => {
    it('clones - deep (default)', () => {
      const child = Command.create({ name: 'child' });
      const cmd1 = Command.create({ name: 'foo', children: [child] });
      const cmd2 = cmd1.clone();

      expect(cmd1).to.not.equal(cmd2); // NB: Not the same instance.
      expect(cmd1.name).to.eql(cmd2.name);
      expect(cmd1.handler).to.equal(cmd2.handler);

      expect(cmd2.children[0]).to.not.equal(child); // NB: NOT the same instance.
      expect(cmd2.children[0].name).to.eql('child');
      expect(cmd2.children[0].handler).to.equal(child.handler);
    });

    it('clones - shallow (deep: false)', () => {
      const child = Command.create({ name: 'child' });
      const cmd1 = Command.create({ name: 'foo', children: [child] });
      const cmd2 = cmd1.clone({ deep: false });

      expect(cmd1).to.not.equal(cmd2); // NB: Not the same instance.
      expect(cmd1.name).to.eql(cmd2.name);
      expect(cmd1.handler).to.equal(cmd2.handler);

      expect(cmd2.children[0]).to.equal(child); // NB: is the same instance.
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

    it('adds a existing command as a child (merge)', () => {
      const cmd1 = Command.create('foo');
      const cmd2 = Command.create('child', () => null);
      cmd1.add(cmd2);

      const child = cmd1.children[0];
      expect(child).to.not.equal(cmd1); // Not the same instance.
      expect(child.name).to.eql('child');
      expect(child.handler).to.equal(cmd2.handler);
    });

    it('id of child includes parent (hash)', () => {
      const HASH = {
        parent: Command.toId({ name: 'parent' }),
        child: Command.toId({ name: 'child' }),
      };
      const parentChildId = Command.toId({ name: 'child', parent: HASH.parent });
      const parent = Command.create('parent').add('child');
      const child = parent.children[0];

      expect(parent.id).to.eql(HASH.parent);
      expect(child.id).to.eql(parentChildId);
    });

    it('throws if the child (name) already exists', () => {
      const fn = () => {
        Command.create('parent')
          .add('child')
          .add('child');
      };
      expect(fn).to.throw(/exists/);
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

  describe('description', () => {
    it('adds with description', () => {
      const cmd = Command
        //
        .create({ name: 'foo', description: 'something' })
        .add({ name: 'child', description: 'my-child' });
      expect(cmd.description).to.eql('something');
      expect(cmd.children[0].description).to.eql('my-child');
    });

    it('trims description', () => {
      const cmd = Command.create({ name: 'foo', description: '  hello  ' });
      expect(cmd.description).to.eql('hello');
    });

    it('trims description (empty)', () => {
      const cmd = Command.create({ name: 'foo', description: '  ' });
      expect(cmd.description).to.eql('');
    });

    it('clones the description (deep)', () => {
      const root1 = Command
        //
        .create({ name: 'foo', description: 'something' })
        .add({ name: 'child', description: 'my-child' });
      const root2 = root1.clone();
      expect(root2.description).to.eql('something');
      expect(root2.children[0].description).to.eql('my-child');
    });

    it('adds description from pre-existing command', () => {
      const cmd1 = Command.create({ name: 'foo', description: 'one' });
      const cmd2 = Command.create({ name: 'bar', description: 'two' });
      cmd1.add(cmd2);

      expect(cmd1.description).to.eql('one');
      expect(cmd2.description).to.eql('two');
      expect(cmd1.children[0].description).to.eql('two');
    });
  });

  describe('param', () => {
    it('adds a parameter', () => {
      const cmd = Command.create('foo')
        .param('bar', 'string')
        .param('baz', ['one', 'two', 'three']);
      expect(cmd.name).to.eql('foo');

      const params = cmd.params;
      expect(params.length).to.eql(2);
      expect(params[0].name).to.eql('bar');
      expect(params[0].type).to.eql('string');
      expect(params[1].name).to.eql('baz');
      expect(params[1].type).to.eql(['one', 'two', 'three']);
    });

    it('adds a parameter with description (from object)', () => {
      const cmd = Command.create('foo').param({
        name: 'bar',
        type: 'string',
        description: 'something',
      });
      const params = cmd.params;
      expect(params.length).to.eql(1);
      expect(params[0].name).to.eql('bar');
      expect(params[0].type).to.eql('string');
      expect(params[0].description).to.eql('something');
    });

    it('adds parameters from existing command', () => {
      const cmd1 = Command.create({ name: 'foo' }).param('one', 'string');
      const cmd2 = Command.create({ name: 'bar' }).param('two', 'number');
      cmd1.add(cmd2);

      expect(cmd1.params[0].name).to.eql('one');
      expect(cmd2.params[0].name).to.eql('two');
      expect(cmd1.children[0].params[0].name).to.eql('two');
    });

    it('clones parameter', () => {
      const cmd1 = Command.create('foo')
        .param('bar', 'string')
        .param({ name: 'baz', type: ['one', 'two', 'three'], description: 'something' });
      const cmd2 = cmd1.clone();

      expect(cmd2.param).to.not.equal(cmd1.params);

      const params = cmd2.params;
      expect(params.length).to.eql(2);
      expect(params[0].name).to.eql('bar');
      expect(params[0].type).to.eql('string');
      expect(params[0].description).to.eql('');
      expect(params[1].name).to.eql('baz');
      expect(params[1].type).to.eql(['one', 'two', 'three']);
      expect(params[1].description).to.eql('something');
    });
  });

  describe('toObject', () => {
    it('deep', () => {
      const myHandler = () => true;
      const cmd = Command.create('root', myHandler)
        .add('a', myHandler)
        .add({ name: 'b', description: 'Bee' });
      cmd.children[1].add('b1', myHandler);
      cmd.children[1].param('myParam', 'boolean');

      const obj = cmd.toObject();

      expect(obj.name).to.eql('root');
      expect(obj.children[0].name).to.eql('a');
      expect(obj.children[1].name).to.eql('b');
      expect(obj.children[1].children[0].name).to.eql('b1');

      expect(obj.children[1].params.length).to.eql(1);
      expect(obj.children[1].params[0].name).to.eql('myParam');
      expect(obj.children[1].params[0].type).to.eql('boolean');

      expect(obj.handler).to.eql(myHandler);
      expect(obj.children[0].handler).to.equal(myHandler);
      expect(obj.children[1].handler).to.not.equal(myHandler); // No explicit handler set.
      expect(obj.children[1].children[0].handler).to.eql(myHandler);
      expect(obj.children[1].description).to.eql('Bee');

      // NB: Function stripped from new object.
      const any: any = obj;
      expect(any.add).to.eql(undefined);
      expect(any.clone).to.eql(undefined);
      expect(any.children[0].add).to.eql(undefined);
      expect(any.children[0].clone).to.eql(undefined);
    });
  });
});
