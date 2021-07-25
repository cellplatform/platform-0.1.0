import React, { useEffect, useState } from 'react';

import { PositioningContainerProps } from '..';

export type Ctx = {
  child: { width?: number; height?: number };
  props: PositioningContainerProps;
};
