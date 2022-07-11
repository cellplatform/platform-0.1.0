import { t } from './common';
import { AspectRatio } from './Util.AspectRatio';

export const Util = {
  AspectRatio,

  /**
   * Calculate the size of an image.
   */
  toSize(image?: HTMLImageElement | null): t.DocImageSize {
    if (!image || image === null) {
      const NULL = { width: -1, height: -1, ratio: '' };
      return { rendered: NULL, natural: NULL };
    } else {
      const toSize = (width: number, height: number) => {
        const ratio = AspectRatio.toString(width, height);
        return { width, height, ratio };
      };
      return {
        rendered: toSize(image.width, image.height),
        natural: toSize(image.naturalWidth, image.naturalHeight),
      };
    }
  },
};
