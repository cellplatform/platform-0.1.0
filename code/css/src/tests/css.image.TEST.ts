import { expect } from 'chai';
import { MEDIA_QUERY_RETINA, image } from '../css';
import { style } from '..';

const browserWindow: any = global;

describe('Image', () => {
  describe('image()', () => {
    afterEach(() => {
      delete browserWindow.devicePixelRatio;
    });

    it('is attached to the [style] as a property', () => {
      expect(style.image).to.equal(image);
    });

    it('throws if an image was not specified', () => {
      expect(() => image(undefined, undefined)).to.throw();
    });

    it('returns the 1x resolution', () => {
      browserWindow.devicePixelRatio = 1;
      const res = image('1x', '2x');
      expect(res.backgroundImage).to.equal('url(1x)');
    });

    it('returns the 2x resolution', () => {
      browserWindow.devicePixelRatio = 2;
      const res = image('1x.png', '2x.png');
      expect(res.backgroundImage).to.equal('url(1x.png)');
      expect(res[MEDIA_QUERY_RETINA].backgroundImage).to.equal('url(2x.png)');
    });

    it('returns the 1x resolution on hi-res screen when no 2x image (undefined)', () => {
      browserWindow.devicePixelRatio = 2;
      expect(image('1x', undefined, { width: 10, height: 20 }).backgroundImage).to.equal('url(1x)');
    });

    it('has width and height values (defaults)', () => {
      const res = image('1x', '2x');
      expect(res.width).to.equal(10);
      expect(res.height).to.equal(10);
    });

    it('has width and height values (specified)', () => {
      const res = image('1x', '2x', { width: 20, height: 150 });
      expect(res.width).to.equal(20);
      expect(res.height).to.equal(150);
    });

    it('has [backgroundSize]', () => {
      const res = image('1x', '2x', { width: 20, height: 150 });
      expect(res.backgroundSize).to.equal('20px 150px');
    });

    it('does not repeat the background', () => {
      const result = image('1x', '2x', { width: 20, height: 150 });
      expect(result.backgroundRepeat).to.equal('no-repeat');
    });
  });

  describe('Image replacement via css() method', () => {
    it('replaces `Image` with style settings (1x)', () => {
      browserWindow.devicePixelRatio = 1;
      const res = style.transform({ Image: ['1x', '2x', 20, 30] }) as any;
      expect(res.Image).to.equal(undefined);
      expect(res.backgroundImage).to.equal('url(1x)');
      expect(res.width).to.equal(20);
      expect(res.height).to.equal(30);
      expect(res.backgroundSize).to.equal('20px 30px');
      expect(res.backgroundRepeat).to.equal('no-repeat');
    });

    it('replaces `Image` with style settings (2x)', () => {
      browserWindow.devicePixelRatio = 2;
      const res = style.transform({
        Image: ['1x.JPG', '2x.JPG', 20, 30],
      }) as any;
      expect(res.Image).to.equal(undefined);
      expect(res.backgroundImage).to.equal('url(1x.JPG)');
      expect(res[MEDIA_QUERY_RETINA].backgroundImage).to.equal('url(2x.JPG)');
    });
  });
});
