import { useEffect, useState } from 'react';

import { t } from '../../common';
import { RecordButtonClickEventHandler, RecordButtonState } from './types';
import { MediaStream } from '../MediaStream';

/**
 * Handles binding the process of recording a MediaStream to the interactions
 * of the <RecordButton>.
 */
export function useRecordController(args: { bus: t.EventBus<any>; ref?: string }) {
  const { ref } = args;
  const bus = args.bus.type<t.MediaEvent>();

  const [onClick, setOnClick] = useState<RecordButtonClickEventHandler>();
  const [state, setState] = useState<RecordButtonState>('default');

  useEffect(() => {
    const record = ref ? MediaStream.RecordController({ bus, ref }) : undefined;

    const handleClick: RecordButtonClickEventHandler = (e) => {
      if (!ref) return;

      if (e.current === 'default') {
        setState('recording');
        bus.fire({ type: 'MediaStream/record/start', payload: { ref } });
      }

      if (e.current === 'recording') {
        setState('paused');
      }

      if (e.current === 'paused') {
        if (e.action === 'finish') {
          setState('default');
          bus.fire({
            type: 'MediaStream/record/stop',
            payload: { ref, download: { filename: 'test' } },
          });
        }

        if (e.action === 'resume') {
          setState('recording');
        }
      }
    };

    setOnClick(() => handleClick);

    return () => {
      record?.dispose();
    };
  }, []); // eslint-disable-line

  return { onClick, state };
}
