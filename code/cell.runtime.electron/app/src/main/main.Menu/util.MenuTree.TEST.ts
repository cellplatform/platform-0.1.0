import { expect, t } from '../../test';
import { MenuTree } from './util.MenuTree';

type N = t.MenuItemNormal;

describe('MenuTree', () => {
  const root: t.MenuItemNormal = {
    id: '0',
    label: 'root',
    type: 'normal',
    submenu: [
      { id: '1', label: 'one', type: 'normal' },
      {
        id: '2',
        label: 'two',
        type: 'normal',
        submenu: [
          { id: '2.1', label: 'two.a', type: 'normal' },
          { id: '2.2', label: 'two.b', type: 'normal' },
        ],
      },
    ],
  };

  describe('walk', () => {
    it('walk: item (deep)', () => {
      const tree = MenuTree(root);
      const walked: t.MenuTreeVisitorArgs[] = [];
      tree.walk((e) => walked.push(e));

      expect(walked.length).to.eql(5);

      const ids = walked.map((item) => item.id);
      expect(ids).to.eql(['0', '1', '2', '2.1', '2.2']);

      expect(walked[0].parent).to.eql(undefined);
      expect(walked[1].parent).to.eql(root);
      expect(walked[4].parent).to.eql(root.submenu?.[1]);
    });

    it('walk: menu', () => {
      const menu: t.Menu = [{ id: 'app', type: 'normal' }, root];
      const tree = MenuTree(menu);

      const walked: t.MenuTreeVisitorArgs[] = [];
      tree.walk((e) => walked.push(e));

      const ids = walked.map((item) => item.id);
      expect(ids).to.eql(['app', '0', '1', '2', '2.1', '2.2']);
    });

    it('walk: stop', () => {
      const tree = MenuTree(root);
      const walked: t.MenuTreeVisitorArgs[] = [];
      tree.walk((e) => {
        walked.push(e);
        if (e.item.id === '1') e.stop();
      });

      const ids = walked.map((item) => item.id);
      expect(ids).to.eql(['0', '1']);
    });

    it('walk: mutates source object', () => {
      const menu: t.Menu = [
        { id: '1', label: 'one', type: 'normal' },
        {
          id: '2',
          label: 'two',
          type: 'normal',
          submenu: [
            { id: '2.1', label: 'two.a', type: 'normal' },
            { id: '2.2', label: 'two.b', type: 'normal' },
          ],
        },
      ];

      MenuTree(menu).walk((e) => {
        if (e.item.type === 'normal') e.item.label = `${e.item.label}:foo`;
      });

      expect((menu[0] as N).label).to.eql('one:foo');
      expect(((menu[1] as N).submenu?.[1] as N).label).to.eql('two.b:foo');
    });
  });

  describe('filter', () => {
    it('single level filter', () => {
      const tree = MenuTree(root);
      const walked: t.MenuTreeVisitorArgs[] = [];

      const exclude = ['1', '2.1'];
      tree.filter((e) => !exclude.includes(e.item.id || '')).walk((e) => walked.push(e));

      const ids = walked.map((item) => item.id);
      expect(ids).to.eql(['0', '2', '2.2']);
    });

    it('second level filter (cumulative)', () => {
      const walked: t.MenuTreeVisitorArgs[] = [];

      MenuTree(root)
        .filter((e) => e.id !== '1')
        .filter((e) => e.id !== '2.2')
        .walk((e) => walked.push(e));

      const ids = walked.map((item) => item.id);
      expect(ids).to.eql(['0', '2', '2.1']);
    });
  });

  describe('find', () => {
    it('match', () => {
      const walked: string[] = [];
      const res = MenuTree(root).find<N>((e) => {
        walked.push(e.id);
        return e.id === '2.1';
      });
      expect(res?.id).to.eql('2.1');
      expect(walked).to.eql(['0', '1', '2', '2.1']); // NB: no items walked after target item is found.
    });

    it('no match', () => {
      const tree = MenuTree(root);
      const res = tree.find((e) => e.id === '404');
      expect(res).to.eql(undefined);
    });

    it('no match (excluded by filter)', () => {
      const res = MenuTree(root)
        .filter((e) => e.id !== '2.2')
        .find((e) => e.id === '2.2');
      expect(res).to.eql(undefined);
    });
  });
});
