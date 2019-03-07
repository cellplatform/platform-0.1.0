import { expect } from 'chai';
import { Command } from '.';
import * as t from './types';

describe.only('Command.tree', () => {
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
  });

  describe('count', () => {
    it('has one node (no children)', () => {
      expect(Command.tree.count(child2)).to.eql(1);
    });

    it('has 5 nodes (including itself)', () => {
      expect(Command.tree.count(root)).to.eql(5);
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
  });
});
