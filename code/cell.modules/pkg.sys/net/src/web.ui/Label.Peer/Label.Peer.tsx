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
};
export type PeerLabelClickEventHandler = (e: PeerLabelClickEvent) => void;

export type PeerLabelProps = {
  id: t.PeerId;
  isCopyable?: boolean;
  media?: MediaStream;
  isSelf?: boolean;
  style?: CssValue;
  onClick?: PeerLabelClickEventHandler;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { media, isCopyable = true, isSelf = false } = props;
  const id = (props.id || '').trim().replace(/^peer\:/, '');
  const uri = `${PREDICATE}:${id || '<id>'}`;

  /**
   * [Render]
   */
  return (
    <Layout
      style={props.style}
      text={uri}
      isCopyable={isCopyable}
      labelOffset={[0, -1]}
      renderIcon={(e) => {
        if (!media) return <Icons.Face size={22} />;
        if (media) {
          return (
            <VideoStream stream={media} width={22} height={22} borderRadius={3} isMuted={isSelf} />
          );
        }
        return undefined;
      }}
      onClick={(e) => {
        const { target } = e;
        props.onClick?.({ id, uri, target, media });
      }}
    />
  );
};
