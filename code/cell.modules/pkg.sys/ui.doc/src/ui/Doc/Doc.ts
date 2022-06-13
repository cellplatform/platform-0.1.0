import { toBlockElements } from './Doc.toBlocks';
import { Index, Layout, Headline, Byline, Block, Image, LayoutContainer, List } from './libs';
import { DocFonts as Fonts } from './Doc.Fonts';

export const Doc = {
  Index,
  Layout,
  Headline,
  Byline,
  Block,
  Image,
  LayoutContainer,
  List,
  Fonts,

  /**
   * Helpers
   */
  toBlockElements,
};
