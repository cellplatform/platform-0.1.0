import { color, constants, style } from '../../common';

const { CSS } = constants;

const styles = {
  // Markdown: `code`.
  [`.${CSS.MARKDOWN} code`]: {
    // color: color.format(-0.6),
    color: '#D12A2A', // Console "red".
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.03)}`,
    borderRadius: 2,
    paddingLeft: 3,
    paddingRight: 3,
  },

  // Markdown: <ul>
  [`.${CSS.MARKDOWN} ul`]: {
    paddingLeft: 18,
  },

  // Action description.
  [`.${CSS.ACTIONS} .${CSS.MARKDOWN} :first-child`]: {
    marginTop: 0,
  },

  // Last paragraph does not push out next element.
  [`.${CSS.ACTIONS} .${CSS.MARKDOWN} p:last-child`]: {
    marginBottom: 0,
  },
};

style.global(styles);
