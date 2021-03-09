import React from 'react';
import { WebRuntime } from '@platform/cell.runtime.web';
import { ModuleIcon } from './ModuleIcon';

import { css, color } from '../../common';
import { Spinner } from '../Primitives';

type O = Record<string, unknown>;

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */

export type RemoteProps = { url: string; namespace: string; entry: string; props?: O };

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
export const Remote: React.FC<RemoteProps> = (props: RemoteProps) => {
  const { url, namespace, entry } = props;

  console.group('🌳 WebRuntime.remote');
  console.log('url', url);
  console.log('namespace', namespace);
  console.log('entry', entry);
  console.groupEnd();

  const remote = WebRuntime.remote({ url, namespace, entry });
  const { ready, failed } = remote.useScript();

  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      padding: 30,
      boxSizing: 'border-box',
      Flex: 'center-center',
    }),
    body: css({
      flex: 1,
      Flex: 'center-center',
    }),
    beforeLoad: {
      base: css({ Flex: 'vertical-center-center' }),
      content: css({ fontSize: 9 }),
      indent: css({
        marginTop: 5,
        paddingLeft: 6,
        borderLeft: `solid 8px ${color.format(-0.06)}`,
      }),
    },
  };

  if (!ready) {
    return (
      <div {...styles.base}>
        <div {...styles.beforeLoad.base}>
          <ModuleIcon />
          <div {...styles.beforeLoad.content}>
            <div>Loading remote cell:</div>
            <div {...styles.beforeLoad.indent}>
              <div>url: {url}</div>
              <div>namespace: {namespace}</div>
              <div>entry: {entry}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (failed) {
    return <div {...styles.base}>Failed to load dynamic script: {url}</div>;
  }

  const elLoading = (
    <div {...styles.base}>
      <Spinner />
    </div>
  );

  const Component = React.lazy(remote.module);

  return (
    <React.Suspense fallback={elLoading}>
      <div {...styles.body}>
        <Component {...props.props} />
      </div>
    </React.Suspense>
  );
};
