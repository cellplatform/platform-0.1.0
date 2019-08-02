import { expect } from 'chai';
import { FileDbSchema } from '.';
import { t } from '../common';

const DEFAULT = FileDbSchema.DEFAULT;
const dir = 'tmp/db';

describe('FileDbSchema', () => {
  describe('path', () => {
    it('no mapping', () => {
      const path = FileDbSchema.path({ dir, schema: DEFAULT, key: 'cell/A1' });
      expect(path).to.eql('tmp/db/cell/A1.json');
    });

    it('maps to different file', () => {
      const schema: t.IFileDbSchema = { paths: { cell: { file: 'sheet' } } };

      const path1 = FileDbSchema.path({ dir, schema, key: 'cell/A1' });
      const path2 = FileDbSchema.path({ dir, schema, key: 'cell/B2' });
      const path3 = FileDbSchema.path({ dir, schema, key: 'cell/' });
      const path4 = FileDbSchema.path({ dir, schema, key: 'cell' });
      const path5 = FileDbSchema.path({ dir, schema, key: 'foo' });

      expect(path1).to.eql('tmp/db/sheet.json');
      expect(path2).to.eql('tmp/db/sheet.json');
      expect(path3).to.eql('tmp/db/sheet.json');
      expect(path4).to.eql('tmp/db/sheet.json');
      expect(path5).to.eql('tmp/db/foo.json');
    });
  });
});
