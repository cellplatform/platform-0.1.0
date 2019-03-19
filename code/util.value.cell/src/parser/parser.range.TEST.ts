import { expect } from 'chai';
import { parser } from '.';

describe('parser.toRangeParts', () => {
  it('A:C', () => {
    const parts = parser.toRangeParts('A:C');
    expect(parts.isValid).to.eql(true);
    expect(parts.left).to.eql('A');
    expect(parts.right).to.eql('C');
  });

  it('A : C  (trim whitespace)', () => {
    const parts = parser.toRangeParts(' A : C ');
    expect(parts.isValid).to.eql(true);
    expect(parts.left).to.eql('A');
    expect(parts.right).to.eql('C');
  });

  it('invalid - single cell returned as left', () => {
    const parts = parser.toRangeParts(' A1 ');
    expect(parts.isValid).to.eql(false);
    expect(parts.left).to.eql('A1');
  });

  it('valid', () => {
    const valid = (key: string) => {
      const parts = parser.toRangeParts(key);
      expect(parts.isValid).to.eql(true, `key '${key}' should be valid.`);
    };
    valid('A:A');
    valid('5:3');
    valid('A1:B2');
  });

  it('invalid', () => {
    const invalid = (key: string) => {
      const parts = parser.toRangeParts(key);
      expect(parts.isValid).to.eql(false, `key '${key}' should be invalid.`);
    };
    invalid('');
    invalid('..');
    invalid('A');
    invalid('1');
    invalid(' A  ');
    invalid('  1 ');
    invalid('A:B:C');
    invalid(':');
    invalid(' A1:');
    invalid(':C34 ');
  });
});
