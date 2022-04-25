import React from 'react';

import { FC, COLORS, css, t } from '../../common';
import { Button } from '../../ui.ref/button/Button';
import { Icons } from '../Icons';

/**
 * Default view of an error rendered by an [ErrorBoundary]
 */
const View: React.FC<t.ErrorViewProps> = (props) => {
  const { error, info: errorInfo } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'center-center',
      boxSizing: 'border-box',
    }),
    body: css({
      position: 'relative',
      minWidth: 400,
      MarginX: 50,
      padding: 30,
      backgroundColor: COLORS.MAGENTA,
      color: COLORS.WHITE,
      borderRadius: 10,
      overflow: 'hidden',
    }),
    close: css({ Absolute: [5, 8, null, null] }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {renderError({ error, info: errorInfo })}
        <Button style={styles.close} onClick={props.onClear}>
          <Icons.Close color={COLORS.WHITE} />
        </Button>
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

function renderError(props: t.ErrorViewProps) {
  const { error, info: errorInfo } = props;
  const componentStack = errorInfo?.componentStack.replace(/^\n/, '');

  const styles = {
    pre: css({ fontSize: 12 }),
  };

  const elStack = componentStack && (
    <div>
      componentStack
      <div>{componentStack}</div>
    </div>
  );

  return (
    <pre {...styles.pre}>
      <div>{error?.message}</div>
      <div>{error?.stack}</div>
      {elStack}
    </pre>
  );
}

/**
 * Export
 */
type Fields = {
  render: t.RenderBoundaryError;
};
export const ErrorViewDefault = FC.decorate<t.ErrorViewProps, Fields>(
  View,
  { render: (props) => <ErrorViewDefault {...props} /> },
  { displayName: 'ErrorViewDefault' },
);
