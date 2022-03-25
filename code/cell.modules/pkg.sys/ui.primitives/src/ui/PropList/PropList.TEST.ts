import { Test, expect } from 'sys.ui.dev';
import { PropList } from '.';

export default Test.describe('PropList', (e) => {
  e.describe('FieldBuilder', (e) => {
    type F = 'Module' | 'Module.Name' | 'Module.Version';

    e.it('no items', () => {
      const builder = PropList.builder<F>();
      expect(builder.items()).to.eql([]);
      expect(builder.items([])).to.eql([]);
    });

    e.it('items {object} | function', () => {
      const item1 = { label: 'Module', value: 'foo@0.0.1' };
      const item2 = { label: 'Name', value: 'Hello' };

      const builder = PropList.builder<F>()
        .field('Module', item1)
        .field('Module.Name', () => item2);

      const items1 = builder.items(['Module', 'Module.Name']);
      const items2 = builder.items(['Module.Name', 'Module']);
      const items3 = builder.items(['Module']);

      expect(items1).to.eql([item1, item2]);
      expect(items2).to.eql([item2, item1]);
      expect(items3).to.eql([item1]);
    });

    e.it('factory return <undefined>', () => {
      const builder = PropList.builder<F>().field('Module', () => undefined);
      const items = builder.items(['Module', 'Module.Name']);
      expect(items).to.eql([]);
    });
  });
});
