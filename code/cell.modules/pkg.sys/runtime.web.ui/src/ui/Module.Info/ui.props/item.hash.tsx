import React from 'react';

import { Chip, DEFAULT, t } from '../common';
import * as k from '../types';

type P = t.PropListItem;

export function toHash(args: {
  manifest: t.ModuleManifest;
  field: k.ModuleInfoFields;
  theme: t.ModuleInfoTheme;
}): P {
  const { theme, manifest, field } = args;

  let label = 'hash';
  if (field === 'hash.files') label = 'files hash';
  if (field === 'hash.module') label = 'module hash';

  const key = field.split('.')[1];
  const hash = manifest.hash[key];
  const data = (
    <Chip.Hash text={hash} icon={false} length={DEFAULT.HASH_CHIP_LENGTH} theme={theme} />
  );

  return {
    label,
    value: { data, clipboard: false },
  };
}
