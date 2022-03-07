import { t } from './common';

export const Calculate = {
  /**
   * CssGrid positioning.
   */
  grid(args: { container?: t.DomRect; position?: t.BoxPosition }) {
    const { container, position } = args;

    if (!container || !position) return;

    type P = 'start' | 'end' | 'center' | 'stretch';

    let x: P | undefined = 'start';
    let y: P | undefined = 'start';

    if (position.x) {
      if (position.x === 'left') x = 'start';
      if (position.x === 'right') x = 'end';
      if (position.x === 'center') x = 'center';
      if (position.x === 'stretch') x = 'stretch';
    }

    if (position.y) {
      if (position.y === 'top') y = 'start';
      if (position.y === 'bottom') y = 'end';
      if (position.y === 'center') y = 'center';
      if (position.y === 'stretch') y = 'stretch';
    }

    return { x, y };
  },
};
