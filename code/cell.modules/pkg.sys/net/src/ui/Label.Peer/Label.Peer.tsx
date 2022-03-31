import React from 'react';

import { CssValue, t, VideoStream } from '../common';
import { Icons } from '../Icons';
import { Layout, LayoutTarget } from '../Label/Layout';

const PREDICATE = 'peer';

export type PeerLabelClickEvent = {
  id: t.PeerId;
  uri: string;
  target: LayoutTarget;
  media?: MediaStream;
  isMoreInfo: boolean;
  isCopyToClipboard: boolean;
};
export type PeerLabelClickEventHandler = (e: PeerLabelClickEvent) => void;

export type PeerLabelProps = {
  id: t.PeerId;
  isCopyable?: boolean;
  media?: MediaStream;
  isSelf?: boolean;
  moreIcon?: boolean;
  style?: CssValue;
  onClick?: PeerLabelClickEventHandler;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { media, isCopyable = true, isSelf = false } = props;

  const id = (props.id || '').trim().replace(/^peer\:/, '');
  const uri = `${PREDICATE}:${id || '<id>'}`;

  const [isCopyIconVisible, setCopyIconVisible] = React.useState(false);

  /**
   * [Render]
   */
  return (
    <Layout
      style={props.style}
      text={uri}
      isCopyable={isCopyable}
      labelOffset={[0, -1]}
      renderIconRight={!props.moreIcon ? false : isCopyIconVisible ? 0 : 1}
      renderIconLeft={(e) => {
        if (!media) return <Icons.Face size={22} />;
        if (media) {
          return (
            <VideoStream
              stream={media}
              isMuted={isSelf}
              width={22}
              height={22}
              borderRadius={3}
              backgroundColor={-0.03}
            />
          );
        }
        return undefined;
      }}
      onClick={(e) => {
        const { target } = e;
        const isMoreInfo = target === 'Icon:Right';
        const isCopyToClipboard = target === 'Icon:Left' && isCopyable;
        props.onClick?.({ id, uri, target, media, isMoreInfo, isCopyToClipboard });
      }}
      onCopyIcon={(e) => {
        setCopyIconVisible(e.isVisible);
      }}
    />
  );
};
