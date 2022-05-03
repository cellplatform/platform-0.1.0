import * as t from '../../common/types';

type Url = string;
type Milliseconds = number;

export type Photo = {
  url: string;
  transition?: Milliseconds;
  duration?: Milliseconds;
};

export type PhotoDefaults = {
  showUrl: boolean;
  transition: Milliseconds;
  duration: Milliseconds;
};

/**
 * <Component>
 */
export type PhotoDefInput = Photo | Photo[] | Url | Url[];
export type PhotoProps = {
  def?: t.PhotoDefInput;
  index?: number;
  defaults?: Partial<PhotoDefaults>;
  style?: t.CssValue;
  onLoaded?: PhotoLoadedEventHandler;
};

export type PhotoLoadedEventHandler = (e: PhotoLoadedEventArgs) => void;
export type PhotoLoadedEventArgs = {
  index: number;
  def: Photo;
  error?: string;
};
