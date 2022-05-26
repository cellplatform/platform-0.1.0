export type FilesizeOptions = {
  /**
   * Decimal place, default is 2
   */
  round?: number;

  /**
   * Decimal separator character, default is `.`
   */
  separator?: string;

  /**
   * Character between the result and suffix, default is ` `
   */
  spacer?: string;

  /**
   * Rounding method, can be round, floor, or ceil, default is round
   */
  roundingMethod?: 'round' | 'floor' | 'ceil';
};
