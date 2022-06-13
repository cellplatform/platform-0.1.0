import { t, DEFAULT, Color, COLORS } from './common';

export const Wrangle = {
  showAsCard(value: t.DocListItemData['showAsCard']): t.DocListCardType | undefined {
    if (!value) return undefined;
    if (value === true) return DEFAULT.showAsCards.whenTrue;
    return value;
  },

  /**
   * Wrangler for <Card> properties.
   */
  card: {
    styles(value: t.DocListItemData['showAsCard']) {
      const type = Wrangle.showAsCard(value);
      const Card = Wrangle.card;

      const isSoft = type === 'Soft';

      const border: t.CardProps['border'] = isSoft ? { color: -0.05 } : {};
      const shadow: t.CardProps['shadow'] = isSoft
        ? { color: Color.alpha(COLORS.DARK, 0.03), blur: 15 }
        : true;

      const background: t.CardProps['background'] = {
        color: Card.bgColor(value),
        blur: Card.bgBlur(value),
      };

      return { background, border, shadow };
    },

    bgColor(value: t.DocListItemData['showAsCard']) {
      const type = Wrangle.showAsCard(value);
      if (!type) return undefined;
      if (type === 'Soft') return 0.25;
      return 1;
    },

    bgBlur(value: t.DocListItemData['showAsCard']) {
      const type = Wrangle.showAsCard(value);
      // if (type === 'Soft') return 5;
      return undefined;
    },
  },
};
