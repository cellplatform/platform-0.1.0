import React, { useState, useEffect } from 'react';
import { css, color, bundle, WebRuntime } from './common';

const BLUE = '#4B89FF';

// WebRuntime.

export type DiagramProps = { imageUrl: string };

export const Diagram: React.FC<DiagramProps> = (props: DiagramProps) => {
  const { imageUrl } = props;
  // const [] = useState()

  const useDynamicScript = (args: { url?: string }) => {
    const { url } = args;
    const [ready, setReady] = React.useState(false);
    const [failed, setFailed] = React.useState(false);

    useEffect(() => {
      if (!url) {
        return;
      }

      const element = document.createElement('script');
      element.src = url;
      element.type = 'text/javascript';
      element.async = true;

      setReady(false);
      setFailed(false);

      element.onload = () => {
        console.log(`Dynamic Script Loaded: ${url}`);
        setReady(true);
      };

      element.onerror = () => {
        console.error(`Dynamic Script Error: ${url}`);
        setReady(false);
        setFailed(true);
      };

      document.head.appendChild(element);

      return () => {
        console.log(`Dynamic Script Removed: ${url}`);
        document.head.removeChild(element);
      };
    }, [url]);

    return { ready, failed };
  };

  // const loadRemote = () => {
  //   const url = 'http://localhost:3000/remoteEntry.js';
  //   console.log('url', url);

  //   useDynamicScript({ url }); // eslint-disable-line
  //   // const loader = WebRuntime.remoteLoader('foo', './Dev');
  //   const loader = WebRuntime.remote({ url, namespace: 'foo', module: './Dev' });

  //   // const Component = React.lazy(loader.loadModule;
  //   console.log('Component', Component);
  // };

  const styles = {
    base: css({
      Absolute: 20,
      Flex: 'vertical-stretch-stretch',
      // padding: 10,
    }),
    top: css({ flex: 1, position: 'relative' }),
    bottom: css({
      position: 'relative',
      borderTop: `solid 3px ${color.format(-0.1)}`,
      paddingTop: 10,
    }),
    image: css({
      Absolute: 0,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // MarginX: 10,
    }),
    button: css({
      // color: BLUE,
      zIndex: 999,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,

      pointerEvents: 'auto',
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.top}>
        <div {...styles.image}></div>
      </div>
      <div {...styles.bottom}>
        <div {...styles.button}>Load Remote</div>
      </div>
    </div>
  );
};
