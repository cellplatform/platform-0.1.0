import React from 'react';

import { t, HashChip } from '../../common';
import { DEFAULT } from '../constants';
import * as m from '../types';

type P = t.PropListItem;

export function toHash(args: { manifest: t.ModuleManifest; field: m.ModuleInfoFields }): P {
  const { manifest, field } = args;

  let label = 'hash';
  if (field === 'hash.files') label = 'files hash';
  if (field === 'hash.module') label = 'module hash';

  const key = field.split('.')[1];
  const hash = manifest.hash[key];
  const data = <HashChip text={hash} icon={false} length={DEFAULT.HASH_CHIP_LENGTH} />;

  return {
    label,
    value: { data, clipboard: false },
  };
}
