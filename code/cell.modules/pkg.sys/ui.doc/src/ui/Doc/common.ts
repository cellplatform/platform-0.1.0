import { t } from '../common';
export * from '../common';

const root = 'https://doc.sys.db.team';
// const root = 'http://localhost:5052';

/**
 * Typefaces.
 */
const NEUTON_REGULAR: t.FontDefinition = {
  family: 'Neuton',
  source: `${root}/static/fonts/neuton-v18-latin-regular.woff`,
  descriptors: { style: 'normal', weight: '400' },
};

const NEUTON_ITALIC: t.FontDefinition = {
  family: 'Neuton',
  source: `${root}/static/fonts/neuton-v18-latin-italic.woff`,
  descriptors: { style: 'italic', weight: '400' },
};

export const FONT = {
  NEUTON: {
    REGULAR: NEUTON_REGULAR,
    ITALIC: NEUTON_ITALIC,
  },
};
