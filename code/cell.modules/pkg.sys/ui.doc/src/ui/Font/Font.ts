import { FontContainer as Container } from './Font.Container';
import { load } from './Font.load';
import { useFont } from './Font.useFont';
import { FontCard } from './ui/FontCard';

/**
 * Tools for working with fonts.
 */
export const Font = {
  Container,
  useFont,
  load,

  UI: { FontCard },
};
