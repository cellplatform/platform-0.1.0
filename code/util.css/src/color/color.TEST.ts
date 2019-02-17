import { expect } from 'chai';
import { color } from '.';

describe('color', () => {
  describe('color.format()', () => {
    const test = (value: string | number | boolean | undefined, output: string | undefined) => {
      expect(color.format(value)).to.eql(output);
    };

    it('converts number to RGBA', () => {
      test(0, 'rgba(0, 0, 0, 0.0)');
      test(1, 'rgba(255, 255, 255, 1)');
      test(0.5, 'rgba(255, 255, 255, 0.5)');
      test(-1, 'rgba(0, 0, 0, 1)');
      test(-0.5, 'rgba(0, 0, 0, 0.5)');
    });

    it('converts TRUE to RED (ruby)', () => {
      test(true, color.RED);
    });

    it('undefined', () => {
      test(undefined, undefined);
    });

    it('string: RGB value', () => {
      const rgb = 'rgb(0, 245, 35)';
      test(rgb, rgb);
    });

    it('string: RGBA value', () => {
      const rgb = 'rgba(0, 245, 35, 0.7)';
      test(rgb, rgb);
    });

    it('string: hex value', () => {
      const hex = '#fff';
      test(hex, hex);
    });

    it('string: hex value with no hash', () => {
      test('fff', '#fff');
    });
  });
});
