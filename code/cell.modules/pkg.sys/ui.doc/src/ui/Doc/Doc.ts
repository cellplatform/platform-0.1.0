import { toBlockElements } from './Doc.toBlocks';
import { Index, Blocks, Headline, Block, Layout, LayoutContainer, List } from './libs';
import { DocFonts as Fonts } from './Doc.Fonts';

export const Doc = {
  Fonts,
  List,
  Index,
  Headline,
  Layout,
  LayoutContainer,
  Block,
  Blocks,

  /**
   * Helpers
   */
  toBlockElements,
};
