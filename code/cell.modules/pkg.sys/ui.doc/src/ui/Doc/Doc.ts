import { toBlockElements } from './Doc.toBlocks';
import { Index, Blocks, Headline, Byline, Block, Image, LayoutContainer, List } from './libs';
import { DocFonts as Fonts } from './Doc.Fonts';

export const Doc = {
  Fonts,
  List,
  Index,
  Headline,
  Byline,
  Image,
  LayoutContainer,
  Block,
  Blocks,

  /**
   * Helpers
   */
  toBlockElements,
};
