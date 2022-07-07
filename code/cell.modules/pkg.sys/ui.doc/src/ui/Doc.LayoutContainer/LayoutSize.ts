import { t } from './common';

type Size = { width: number; height: number };

const NONE = -1;

/**
 * Default size calculator for the <Layout> component.
 */
const calculate: t.CalculateDocLayoutSizes = (root) => {
  const { width, height } = root;
  const column = LayoutSize.column(root);
  return {
    root: { width, height },
    column,
  };
};

/**
 * Helpers for working with document size dimensions.
 */
export const LayoutSize = {
  calculate,

  column(root: Size) {
    const toWidth = () => {
      if (root.width < 0) return NONE;
      if (root.width < 670) return 300;
      if (root.width < 850) return 500;
      return 720;
    };
    return {
      width: toWidth(),
      height: LayoutSize.formatNumber(root.height),
    };
  },

  formatNumber(size: number) {
    return size < 0 ? NONE : size;
  },

  dummy(): t.DocLayoutSizes {
    return calculate({ width: NONE, height: NONE });
  },
};
