import { t } from './common';

type Size = { width: number; height: number };

export const LayoutSize = {
  column(root: Size) {
    const toWidth = () => {
      if (root.width < 0) return -1;
      if (root.width < 670) return 300;
      if (root.width < 850) return 500;
      return 720;
    };
    return {
      width: toWidth(),
      height: root.height < 0 ? -1 : root.height,
    };
  },

  toSizes(root: Size): t.DocLayoutSizes {
    const { width, height } = root;
    const column = LayoutSize.column(root);
    return { root: { width, height }, column };
  },

  dummy(): t.DocLayoutSizes {
    return LayoutSize.toSizes({ width: -1, height: -1 });
  },
};
