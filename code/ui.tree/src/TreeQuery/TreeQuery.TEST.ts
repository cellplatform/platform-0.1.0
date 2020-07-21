import { expect, t } from '../test';
import { TreeQuery } from '.';

const create = TreeQuery.create;

type N = t.ITreeNode;

describe.only('TreeQuery', () => {
  describe('create', () => {
    it('with root (default node type)', () => {
      const root: N = { id: 'root' };
      const query = create(root);
      expect(query.root).to.equal(root);
    });

    it('with root (specific node type)', () => {
      type T = N & { count: number };
      const root: T = { id: 'root', count: 0 };
      const query = create<T>(root);
      expect(query.root).to.equal(root);
    });
  });

  describe('children (static)', () => {
    it('no arguments', () => {
      let count = 0;
      const res = TreeQuery.children(undefined, () => count++);

      expect(res).to.eql([]);
      expect(count).to.eql(1);
    });

    it('no childen => empty array (and assigns by default)', () => {
      const node: N = { id: 'root' };
      expect(node.children).to.eql(undefined);

      const res = TreeQuery.children(node);

      expect(res).to.eql([]);
      expect(node.children).to.equal(res);
    });

    it('no childen => empty array (and does not assign)', () => {
      const node: N = { id: 'root' };
      expect(node.children).to.eql(undefined);

      const res1 = TreeQuery.children(node, { assign: false });
      expect(res1).to.eql([]);
      expect(node.children).to.equal(undefined);

      const res2 = TreeQuery.children(node, undefined, { assign: false });
      expect(res2).to.eql([]);
      expect(node.children).to.equal(undefined);
    });

    it('returns child array (instance)', () => {
      const node = { id: 'root', children: [{ id: 'child' }] };
      expect(TreeQuery.children(node)).to.eql([{ id: 'child' }]);
    });

    it('runs visitor function', () => {
      const node = { id: 'root', children: [{ id: 'child-1' }, { id: 'child-2' }] };

      const visits: N[] = [];
      TreeQuery.children(node, (children) => children.forEach((child) => visits.push(child)));

      expect(visits.map((c) => c.id)).to.eql(['child-1', 'child-2']);
    });
  });

  describe('hasChild (static)', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };

    it('does have child', () => {
      expect(TreeQuery.hasChild(root, 'B')).to.eql(true);
      expect(TreeQuery.hasChild(root, 'C')).to.eql(true);
      expect(TreeQuery.hasChild(root, { id: 'C' })).to.eql(true);
    });

    it('does not have child', () => {
      expect(TreeQuery.hasChild(root, 'A')).to.eql(false);
      expect(TreeQuery.hasChild(root, 'NO_MATCH')).to.eql(false);
      expect(TreeQuery.hasChild(root, undefined)).to.eql(false);
      expect(TreeQuery.hasChild(undefined, undefined)).to.eql(false);
    });
  });

  describe('walkDown', () => {
    it('walks from root', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };
      const query = create(tree);

      const nodes: N[] = [];
      query.walkDown((e) => nodes.push(e.node));

      expect(nodes.length).to.eql(3);
      expect(nodes[0]).to.equal(tree);
      expect(nodes[1]).to.equal(tree.children && tree.children[0]);
      expect(nodes[2]).to.equal(tree.children && tree.children[1]);
    });

    it('skips walking children of descendent (`.skip`)', () => {
      const tree: N = {
        id: 'root',
        children: [
          { id: 'child-1', children: [{ id: 'child-1.1' }, { id: 'child-1.1' }] },
          { id: 'child-2' },
        ],
      };
      const query = create(tree);

      const nodes: N[] = [];
      query.walkDown((e) => {
        nodes.push(e.node);
        if (e.node.id === 'child-1') {
          e.skip();
        }
      });

      expect(nodes.length).to.eql(3);
      expect(nodes[0].id).to.eql('root');
      expect(nodes[1].id).to.eql('child-1');
      expect(nodes[2].id).to.eql('child-2');
    });

    it('passes parent as args', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [child] };
      const query = create(root);

      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items.length).to.eql(3);

      expect(items[0].depth).to.eql(0);
      expect(items[1].depth).to.eql(1);
      expect(items[2].depth).to.eql(2);

      expect(items[0].parent).to.eql(undefined);
      expect(items[1].parent).to.eql(root);
      expect(items[2].parent).to.eql(child);
    });

    it('reports node index (sibling position)', () => {
      const root: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };
      const query = create(root);

      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items[0].index).to.eql(-1);
      expect(items[1].index).to.eql(0);
      expect(items[2].index).to.eql(1);
    });
  });

  describe('walkUp', () => {
    const tree: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
    };

    it('walks to root', () => {
      const query = create(tree);
      const start = query.findById('grandchild-1');

      const items: t.ITreeAscend[] = [];
      query.walkUp(start, (e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items.map((e) => e.node.id)).to.eql(['grandchild-1', 'child-2', 'root']);

      expect(items[0].parent && items[0].parent.id).to.eql('child-2');
      expect(items[1].parent && items[1].parent.id).to.eql('root');
      expect(items[2].parent && items[2].parent.id).to.eql(undefined);

      expect(items[0].index).to.eql(0);
      expect(items[1].index).to.eql(1);
      expect(items[2].index).to.eql(-1);
    });

    it('stops mid-way', () => {
      const query = create(tree);
      const start = query.findById('grandchild-1');
      const list: t.ITreeAscend[] = [];
      query.walkUp(start, (e) => {
        list.push(e);
        if (e.node.id === 'child-2') {
          e.stop();
        }
      });

      expect(list.length).to.eql(2);
      expect(list.map((e) => e.node.id)).to.eql(['grandchild-1', 'child-2']);
    });
  });

  describe('find', () => {
    const tree: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('find (via node)', () => {
      const query = create(tree);
      const res1 = query.find((e) => e.node.id === 'child-3');
      const res2 = query.find((e) => e.node.id === 'NO_EXIT');
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
    });

    it('findById', () => {
      const query = create(tree);
      const res1 = query.findById('child-3');
      const res2 = query.findById('NO_EXIST');
      const res3 = query.findById(undefined);
      const res4 = query.findById({ id: 'child-2' });
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
      expect(res3).to.eql(undefined);
      expect(res4).to.eql({ id: 'child-2', children: [{ id: 'child-3' }] });
    });
  });

  describe('findParent', () => {
    it('has a parent', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [child] };
      const query = create(root);

      expect(query.findParent(child)).to.equal(root);
      expect(query.findParent(grandchild)).to.equal(child);
    });

    it('has no parent', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [] };
      const query = create(root);

      expect(query.findParent(child)).to.equal(undefined);
      expect(query.findParent(grandchild)).to.equal(undefined);
    });
  });
});
