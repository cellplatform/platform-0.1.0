import { expect } from 'chai';
import { Command } from '.';
import * as t from './types';

describe('Command.tree', () => {
  /**
   * Sample tree structure.
   */
  const grandchild1 = Command.create('grandchild-1');
  const grandchild2 = Command.create('grandchild-2');
  const child1 = Command.create('child-1')
    .add(grandchild1)
    .add(grandchild2);
  const child2 = Command.create('child-2'); // No children.
  const root = Command.create('root')
    .add(child1)
    .add(child2);

  describe('walk', () => {
    it('walks (single level - starting command)', () => {
      const events: t.ICommand[] = [];
      Command.tree.walk(child2, e => events.push(e.command));
      expect(events.length).to.eql(1);
      expect(events[0].name).to.equal('child-2');
    });

    it('walks (one level)', () => {
      const events: t.ICommand[] = [];
      Command.tree.walk(child1, e => events.push(e.command));
      expect(events.length).to.eql(3);
      expect(events[0].name).to.eql('child-1');
      expect(events[1].name).to.eql('grandchild-1');
      expect(events[2].name).to.eql('grandchild-2');
    });

    it('walks (two levels)', () => {
      const events: t.ICommand[] = [];
      Command.tree.walk(root, e => events.push(e.command));
      expect(events.length).to.eql(5);
      expect(events[0].name).to.eql('root');
      expect(events[1].name).to.eql('child-1');
      expect(events[2].name).to.eql('grandchild-1');
      expect(events[3].name).to.eql('grandchild-2');
      expect(events[4].name).to.eql('child-2');
    });

    it('stops after first command', () => {
      const events: t.ICommand[] = [];
      Command.tree.walk(root, e => {
        events.push(e.command);
        e.stop();
      });
      expect(events.length).to.eql(1);
      expect(events[0].name).to.eql('root');
    });

    it('stops midway through', () => {
      const events: t.ICommand[] = [];
      Command.tree.walk(root, e => {
        events.push(e.command);
        if (e.command.name === 'grandchild-1') {
          e.stop();
        }
      });
      expect(events.length).to.eql(3);
      expect(events[0].name).to.eql('root');
      expect(events[1].name).to.eql('child-1');
      expect(events[2].name).to.eql('grandchild-1');
    });

    it('instance methods', () => {
      const events: t.ICommand[] = [];
      root.tree.walk(e => events.push(e.command));
      expect(events.length).to.eql(5);
    });
  });

  describe('count', () => {
    it('has one node (no children)', () => {
      expect(Command.tree.count(child2)).to.eql(1);
    });

    it('has 5 nodes (including itself)', () => {
      expect(Command.tree.count(root)).to.eql(5);
    });

    it('instance method', () => {
      expect(root.tree.count).to.eql(5);
    });
  });

  describe('find', () => {
    it('no match (undefined)', () => {
      const res = Command.tree.find(root, () => false);
      expect(res).to.eql(undefined);
    });

    it('finds the given command', () => {
      const res = Command.tree.find(root, cmd => cmd.name === 'child-2');
      expect(res && res.name).to.eql('child-2');
    });

    it('instance method', () => {
      const res = root.tree.find(cmd => cmd.name === 'child-2');
      expect(res && res.name).to.eql('child-2');
    });
  });

  describe('parent', () => {
    it('has no parent', () => {
      const res = Command.tree.parent(root, root);
      expect(res).to.eql(undefined);
    });

    it('has a parent (by name)', () => {
      const res = Command.tree.parent(root, grandchild1.name);
      expect(res && res.name).to.eql('child-1');
    });

    it('has a parent (by id)', () => {
      const grandchild = root.children[0].children[1];
      const res = Command.tree.parent(root, grandchild.id);
      expect(res && res.name).to.eql('child-1');
    });

    it('has a parent (by command object)', () => {
      const grandchild = root.children[0].children[1];
      const res = Command.tree.parent(root, grandchild);
      expect(res && res.name).to.eql('child-1');
    });

    it('instance method', () => {
      const grandchild = root.children[0].children[1];
      const res1 = root.tree.parent(root);
      const res2 = grandchild.tree.parent(root);
      expect(res1).to.eql(undefined);
      expect(res2 && res2.name).to.eql('child-1');
    });
  });

  describe('pathTo', () => {
    it('empty', () => {
      const random = Command.create('FOO');
      const res = Command.tree.toPath(root, random);
      expect(res).to.eql([]);
    });

    it('single item (same)', () => {
      const res = Command.tree.toPath(root, root);
      expect(res.length).to.eql(1);
      expect(res[0] && res[0].id).to.eql(root.id);
    });

    it('child (2 levels)', () => {
      const child = root.children[0];
      const res = Command.tree.toPath(root, child);
      expect(res.length).to.eql(2);
      expect(res[0].name).to.eql('root');
      expect(res[1].name).to.eql('child-1');
    });

    it('grandchild (3 levels)', () => {
      const grandchild = root.children[0].children[1];
      const res = Command.tree.toPath(root, grandchild);
      expect(res.length).to.eql(3);
      expect(res[0].name).to.eql('root');
      expect(res[1].name).to.eql('child-1');
      expect(res[2].name).to.eql('grandchild-2');
    });

    it('instance method', () => {
      const grandchild = root.children[0].children[1];
      const res = root.tree.toPath(grandchild);
      expect(res.length).to.eql(3);
      expect(res[0].name).to.eql('root');
      expect(res[1].name).to.eql('child-1');
      expect(res[2].name).to.eql('grandchild-2');
    });
  });

  describe('fromPath', () => {
    it('undefined', () => {
      const res1 = Command.tree.fromPath(root, '');
      const res2 = Command.tree.fromPath(root, 'NOTHING');
      const res3 = Command.tree.fromPath(root, 'foo.bar.baz');
      expect(res1).to.eql(undefined);
      expect(res2).to.eql(undefined);
      expect(res3).to.eql(undefined);
    });

    it('finds the root (not a deep path)', () => {
      const res = Command.tree.fromPath(root, 'root');
      expect(res && res.name).to.eql('root');
    });

    it('finds deep path (3 levels)', () => {
      const res1 = Command.tree.fromPath(root, 'root.child-1.grandchild-1');
      const res2 = Command.tree.fromPath(root, 'root.child-1.grandchild-2');
      expect(res1 && res1.name).to.eql('grandchild-1');
      expect(res2 && res2.name).to.eql('grandchild-2');
    });

    it('instance method', () => {
      const res1 = root.tree.fromPath('YO');
      const res2 = root.tree.fromPath('root.child-1.grandchild-2');
      expect(res1).to.eql(undefined);
      expect(res2 && res2.name).to.eql('grandchild-2');
    });
  });
});
