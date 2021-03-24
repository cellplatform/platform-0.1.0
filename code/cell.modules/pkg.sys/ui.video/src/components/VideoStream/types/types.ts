export type MediaStreamMimetype = 'video/webm';
export type MediaStreamKind = 'video' | 'screen';

export type MediaStreamTrack = {
  kind: 'audio' | 'video';
  id: string;
  isEnabled: boolean;
  isMuted: boolean;
  label: string;
  state: 'live' | 'ended';
};
