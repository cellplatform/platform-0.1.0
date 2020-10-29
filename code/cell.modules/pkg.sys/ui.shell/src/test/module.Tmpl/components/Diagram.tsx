import * as React from 'react';
import { css } from '../common';

export type DiagramProps = { url: string };

export const Diagram: React.FC<DiagramProps> = (props: DiagramProps) => {
  const { url } = props;

  const styles = {
    base: css({
      Absolute: 0,
    }),
    inner: css({
      Absolute: 0,
      backgroundImage: `url(${url})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.inner}></div>
    </div>
  );
};
