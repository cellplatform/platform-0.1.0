import React from 'react';
import { bundle, css, CssValue, log } from '../../common';
import Award from '../../../static/images/award.svg';

log.info('bundle', bundle);

export type SampleProps = { count: number; style?: CssValue };

export const Sample: React.FC<SampleProps> = (props: SampleProps) => {
  const styles = {
    base: css({ PaddingX: 30 }),
    images: css({ Absolute: [-8, 0, null, null], Flex: 'horizontal-center-center' }),
    wax: css({ width: 120 }),
    award: { opacity: 0.7, transform: 'rotate(-10deg)', marginRight: -15 },
    ul: css({ fontSize: 14, fontFamily: 'monospace' }),
    key: css({ display: 'inline-block', width: 60 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <h1>{props.count}. Hello World! </h1>
      <div {...styles.images}>
        <Award width={60} style={styles.award} />
        <img src={bundle.path('/static/images/wax@2x.png')} {...styles.wax} />
      </div>
      <ul {...styles.ul}>
        {Object.keys(bundle)
          .map((key) => ({ key, value: bundle[key] }))
          .filter(({ value }) => typeof value !== 'function')
          .map(({ key, value }, i) => {
            return (
              <div key={i}>
                <div {...styles.key}>{key}</div> {value?.toString() || '<undefined>'}
              </div>
            );
          })}
      </ul>
    </div>
  );
};

export default Sample;
