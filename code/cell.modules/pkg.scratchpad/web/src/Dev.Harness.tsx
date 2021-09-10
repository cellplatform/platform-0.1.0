import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Slider: import('./components/Slider/DEV'),
  Crdt: import('./components/Crdt/dev/DEV'),
  SlugProject: import('./components/SlugProject/dev/DEV'),
  WorkerBus: import('./components/WorkerBus/dev/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
