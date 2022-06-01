import { Filesystem, t, slug } from '../common';

export function TestFilesystem(bus: t.EventBus<any>) {
  let _fs: undefined | t.Fs;

  const instance = {
    bus,
    id: `foo.${slug()}`,
    fs: 'fs:dev.tests',
  };

  const api = {
    instance,
    ready: false,

    get events() {
      return _fs || (_fs = Filesystem.Events({ bus, id: instance.fs }).fs());
    },

    async init() {
      if (!api.ready) {
        await Filesystem.IndexedDb.create({ bus, fs: instance.fs }).ready();
        api.ready = true;
      }
      return api.events;
    },
  };

  return api;
}
