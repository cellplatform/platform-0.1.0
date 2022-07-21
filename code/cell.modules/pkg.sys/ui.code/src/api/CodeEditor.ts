import { singleton, CodeEditorSingletonController } from './CodeEditor.Singleton';
import { t, LANGUAGES as languages, rx } from './common';
import { Configure } from './Configure';
import { CodeEditorEvents as events } from './Events';

type T = { [key: string]: t.CodeEditorEvents };
const _singleton: T = {};

/**
 * Static entry points.
 */
export const CodeEditor = {
  Configure,
  languages,
  singleton,
  events,

  /**
   * Initialize an environment
   */
  start(bus: t.EventBus<any>) {
    const key = rx.bus.instance(bus);
    const controller = _singleton[key] || (_singleton[key] = CodeEditorSingletonController(bus));

    return controller;
  },
};
