import React from 'react';

import { css, DEFAULT, FC } from './common';
import { PhotoProps } from './types';
import { DefsSelector } from './ui/Debug.DefsSelector';
import { Image } from './ui/Image';
import { useIndexSequence } from './useIndexSequence';
import { Util } from './Util';

export { PhotoProps };

/**
 * Component
 */
const View: React.FC<PhotoProps> = (props) => {
  const { index = DEFAULT.index, defaults = {} } = props;
  const defs = Util.toDefs(props.def, props.defaults);

  const images = defs.map((def, i) => {
    const isCurrent = i === index;
    const opacity = isCurrent ? 1 : 0;
    return (
      <Image
        key={`${i}.${def.url}`}
        index={i}
        def={def}
        opacity={opacity}
        defaults={defaults}
        onLoaded={props.onLoaded}
      />
    );
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', overflow: 'hidden' }),
  };
  return <div {...css(styles.base, props.style)}>{images}</div>;
};

/**
 * Export
 */
type Fields = {
  default: typeof DEFAULT;
  toDefs: typeof Util.toDefs;
  Debug: { DefsSelector: typeof DefsSelector };
  useIndexSequence: typeof useIndexSequence;
};
export const Photo = FC.decorate<PhotoProps, Fields>(
  View,
  {
    default: DEFAULT,
    toDefs: Util.toDefs,
    Debug: { DefsSelector },
    useIndexSequence,
  },
  { displayName: 'Photo' },
);
