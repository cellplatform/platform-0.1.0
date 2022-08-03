import * as React from 'react';

import { css, CssValue, Color, t, constants } from '../../common';
import { Subject, SubjectCropmark } from './Subject';
import { Icons } from '../Icons';
import { Button } from '../Primitives';

export type ActionsVisible = { value: boolean; onClick?: (e: { current: boolean }) => void };

export type HostLayoutProps = {
  env: t.ActionsModelEnv;
  host?: t.Host;
  subject?: t.ActionSubject<any>;
  actionsOnEdge: 'left' | 'right';
  actionsVisible?: ActionsVisible;
  style?: CssValue;
};

/**
 * A content container providing layout options for testing.
 */
export const HostLayout: React.FC<HostLayoutProps> = (props) => {
  const { subject, host, actionsVisible, actionsOnEdge } = props;
  const items = subject?.items || [];
  const orientation = host?.orientation ?? 'y';
  const spacing = Math.max(0, host?.spacing ?? 60);

  const envLayout = { ...props.env.viaSubject.layout, ...props.env.viaAction.layout };
  const labelColor = envLayout.labelColor ?? -0.5;

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      color: Color.format(host?.color),
      ...toBackground(host),
    }),
    body: css({
      Absolute: 0,
      boxSizing: 'border-box',
      Flex: `${orientation}-center-center`,
      WebkitAppRegion: 'drag', // NB: Window draggable within electron.
    }),
    fullscreen: { button: css({ Absolute: [4, 7, null, null] }) },
    flipX: css({ transform: 'scaleX(-1)' }),
  };

  const showActions = actionsVisible?.value === true;
  const elActionsPanelIcon = (
    <Icons.Sidebar
      color={labelColor}
      style={actionsOnEdge === 'right' ? styles.flipX : undefined}
      opacity={showActions ? 0.8 : 0.3}
    />
  );
  const elActionsPanelButton = actionsVisible !== undefined && (
    <Button
      style={styles.fullscreen.button}
      onClick={() => actionsVisible?.onClick?.({ current: actionsVisible.value })}
    >
      {elActionsPanelIcon}
    </Button>
  );

  const elContent = items.map((item, i) => {
    const isLast = i === items.length - 1;
    const layout = { ...subject?.layout, ...item.layout };

    const abs = toAbsolute(layout.position);
    const margin = !isLast && layout.position === undefined ? spacing : undefined;
    const cropmark: SubjectCropmark = { size: 15, margin: 6 };

    const style = css({
      display: 'flex',
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: layout.border ? `solid 1px ${toBorderColor(layout.border)}` : undefined,
      backgroundColor: Color.format(layout.background),
      marginBottom: orientation === 'y' && margin ? margin : undefined,
      marginRight: orientation === 'x' && margin ? margin : undefined,
      marginLeft: layout.offset?.[0],
      marginTop: layout.offset?.[1],
    });

    return (
      <div key={i} {...style}>
        <Subject cropmark={cropmark} layout={layout}>
          {item.el}
        </Subject>
      </div>
    );
  });

  return (
    <div {...css(styles.base, props.style)} className={constants.CSS.HOST}>
      <div {...styles.body}>{elContent}</div>
      {elActionsPanelButton}
    </div>
  );
};

/**
 * Helpers
 */
const toAbsolute = (input: t.HostedLayout['position']): t.EdgePosition | undefined => {
  if (input === undefined) return undefined;

  if (Array.isArray(input)) {
    type Input = string | number | null | undefined;
    const toValue = (value: Input) => (value === null ? undefined : value);
    const index = (index: number) => toValue(input[index]);

    if (input.length > 2) {
      return { top: index(0), right: index(1), bottom: index(2), left: index(3) };
    } else {
      const y = index(0);
      const x = index(1);
      return { top: y, right: x, bottom: y, left: x };
    }
  }

  if (typeof input !== 'object') {
    return { top: input, right: input, bottom: input, left: input };
  }

  return input as t.EdgePosition;
};

const toBorderColor = (input: t.HostedLayout['border']) => {
  const border = input ?? true;
  const value = border === true ? 0.3 : border === false ? 0 : border;
  return Color.format(value);
};

const toBackground = (host?: t.Host): React.CSSProperties => {
  if (!host) return {};

  const value = host.background;

  if (typeof value === 'string' && value.includes('url(')) {
    return {
      backgroundImage: value,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    };
  }

  return {
    backgroundColor: Color.format(value),
  };
};
