import { t } from './common';
import { AspectRatio } from './Util.AspectRatio';

export const Util = {
  AspectRatio,

  /**
   * Calculate the size of an image.
   */
  toSize(image?: HTMLImageElement | null): t.DocImageSize {
    if (!image || image === null) {
      const NULL = { width: -1, height: -1 };
      return { rendered: NULL, natural: NULL };
    } else {
      return {
        rendered: { width: image.width, height: image.height },
        natural: { width: image.naturalWidth, height: image.naturalHeight },
      };
    }
  },
};
