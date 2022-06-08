import { t } from './common';

export const LayoutSize = {
  column(root: t.DomRect) {
    const toWidth = () => {
      if (root.width < 670) return 300;
      if (root.width < 850) return 500;
      return 720;
    };
    return {
      width: toWidth(),
      height: root.height,
    };
  },

  toSizes(root: t.DomRect): t.DocLayoutSizes {
    const centerColumn = LayoutSize.column(root);
    return { root, column: centerColumn };
  },
};
