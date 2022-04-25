import * as t from '../../common/types';

export type PhotoDefInput = Photo | Photo[];
export type Photo = { url: string };

/**
 * <Component>
 */
export type PhotoProps = {
  def?: t.PhotoDefInput;
  index?: number;
  style?: t.CssValue;
};
