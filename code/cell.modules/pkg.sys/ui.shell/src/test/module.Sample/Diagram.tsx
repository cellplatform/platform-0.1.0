import * as React from 'react';
import { css } from './common';

export type DiagramProps = { imageUrl: string };

export const Diagram: React.FC<DiagramProps> = (props: DiagramProps) => {
  const { imageUrl } = props;

  const styles = {
    base: css({ Absolute: 0 }),
    image: css({
      Absolute: 0,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      MarginX: 10,
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.image}></div>
    </div>
  );
};
