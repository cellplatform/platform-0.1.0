import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Conversation: import('./components/Conversation/DEV'),
  Peer: import('./components/Conversation/Peer/DEV'),
  Slider: import('./components/Slider/DEV'),
  Crdt: import('./components/Crdt/dev/DEV'),
  SlugProject: import('./components/SlugProject/dev/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
