import React from 'react';
import { WebRuntime } from '@platform/cell.runtime.web';

import { css } from '../../common';

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */

export type RemoteProps = { url: string; namespace: string; entry: string };

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
    }),
    body: css({
      flex: 1,
      Flex: 'center-center',
    }),
  };

  if (!ready) {
    return (
      <div {...styles.base}>
        <div>Loading dynamic script:</div>
        <div>{url}</div>
      </div>
    );
  }
  if (failed) {
    return <div {...styles.base}>Failed to load dynamic script: {url}</div>;
  }

  const elLoading = <div {...styles.base}>Loading...</div>;
  const Component = React.lazy(remote.module);

  return (
    <React.Suspense fallback={elLoading}>
      <div {...styles.body}>
        <Component theme={'light'} isRightListVisible={true} />
      </div>
    </React.Suspense>
  );
};
