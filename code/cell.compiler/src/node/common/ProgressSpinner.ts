import ora from 'ora';

import { log, value } from './libs';

/**
 * A CLI spinner that reports progress.
 */
export function ProgressSpinner(args: { label?: string; total?: number }) {
  const instance = ora();

  const state = {
    current: -1,
    total: args.total || -1,
    label: (args.label || '').trim(),
  };

  const updateText = () => {
    let label = state.label;
    label = label.trim();

    if (state.current >= 0 && state.total >= 0) {
      const percent = value.round(state.total / state.current, 0);
      label = `${label} (${percent})`;
    }

    instance.text = log.gray(label);
  };

  const spinner = {
    start() {
      updateText();
      instance.start();
      return spinner;
    },
    stop() {
      instance.text = '';
      instance.stop();
      return spinner;
    },
    update(options: { total?: number; current?: number; label?: string } = {}) {
      state.total = typeof options.total === 'number' ? options.total : state.total;
      state.current = typeof options.current === 'number' ? options.current : state.current;
      updateText();
      return spinner;
    },
  };

  return spinner;
}
