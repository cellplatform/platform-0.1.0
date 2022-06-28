import { ObjectView } from 'sys.ui.dev';

import React from 'react';
import { COLORS, Color, css, CssValue, t, Spinner } from '../../common';
import { useModule } from '..';

type Id = string;

export type DevSampleProps = {
  instance: { bus: t.EventBus<any>; id?: Id };
  url?: t.ManifestUrl;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { instance, url } = props;

  const remote = useModule({ instance, url });
  const Component = remote.module?.default;
  const isLoading = remote.loading;

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, position: 'relative', Flex: 'horizontal-stretch-stretch' }),
    left: css({ flex: 1, position: 'relative', overflow: 'hidden' }),
    right: css({
      position: 'relative',
      width: 350,
      padding: 15,
      borderLeft: `solid 1px ${Color.alpha(COLORS.MAGENTA, 0.5)}`,
    }),
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      opacity: 0.4,
      fontSize: 12,
      fontStyle: 'italic',
      userSelect: 'none',
    }),
    loading: css({
      Absolute: 0,
      Flex: 'center-center',
    }),
  };

  const elSpinner = isLoading && (
    <div {...styles.loading}>
      <Spinner />
    </div>
  );
  const elEmpty = !Component && !elSpinner && <div {...styles.empty}>Module not loaded.</div>;
  const elModule = Component && <Component bus={instance.bus} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        {elEmpty}
        {elSpinner}
        {elModule}
      </div>
      <div {...styles.right}>
        <ObjectView name={'useModule'} data={remote} expandLevel={3} fontSize={11} />
      </div>
    </div>
  );
};
