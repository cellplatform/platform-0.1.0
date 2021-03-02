import { SVG, Element as SvgElement } from '@svgdotjs/svg.js';

export { SvgElement };

export type ISvgRef = {
  filename: string;
  find(id: string): SvgElement | undefined;
};

/**
 * A helper for working with SVG objects within the given container element.
 */
export function SvgRef(filename: string, elContainer: HTMLElement): ISvgRef {
  filename = (filename || '')
    .trim()
    .replace(/^\#/, '')
    .replace(/\.svg$/, '');
  filename = `${filename}.svg`;

  return {
    filename,
    find(id: string) {
      id = (id || '').trim().replace(/^\#/, '');
      const query = `#${format.toId(filename)}__${format.toId(id)}`;
      const el = elContainer.querySelector(query);
      return el ? SVG(el) : undefined;
    },
  };
}

/**
 * [Helpers]
 */

export const format = {
  toId: (value: string) => value.replace(/\./g, '_'),
};
