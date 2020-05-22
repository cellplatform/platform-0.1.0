import { style } from '..';

style.global({
  body: {
    color: 'white',
    background: '#ED3C6E',
    fontFamily: undefined,
  },

  '.sample, .foo': {
    color: 'blue',
  },

  '[type="search"]::-webkit-search-decoration': {
    WebkitAppearance: 'none',
  },
});
