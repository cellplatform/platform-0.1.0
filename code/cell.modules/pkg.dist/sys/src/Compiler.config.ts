import { Compiler, Package } from '@platform/cell.compiler';

export default () =>
  Compiler.config()
    .namespace('sys')
    .version(Package.version)

    .variant('web', (config) =>
      config
        .target('web')
        .port(5050)

        .static('static')
        .files((e) => e.redirect(false, '*.worker.js').access('public', '**/*.{png,jpg,svg}'))
        .shared((e) => e.add(e.dependencies).singleton(['react', 'react-dom']))

        /**
         * EXPORTS: Development
         */
        .expose('./DEV.sys.fs', './src/exports/sys/DEV.Fs')
        .expose('./DEV.sys.data.crdt', './src/exports/sys/DEV.Data.Crdt')
        .expose('./DEV.sys.data.json', './src/exports/sys/DEV.Data.Json')
        .expose('./DEV.sys.runtime.web', './src/exports/sys/DEV.Runtime.Web')
        .expose('./DEV.sys.runtime.web.ui', './src/exports/sys/DEV.Runtime.Web.UI')
        .expose('./DEV.sys.ui.dev', './src/exports/sys/DEV.UI.Dev')
        .expose('./DEV.sys.ui.doc', './src/exports/sys/DEV.UI.Doc')
        .expose('./DEV.sys.ui.primitives', './src/exports/sys/DEV.UI.Primitives')
        .expose('./DEV.sys.ui.video', './src/exports/sys/DEV.UI.Video')

        .expose('./DEV.sample error (on module load)', './src/exports/sample/ERROR.OnModuleLoad')
        .expose('./DEV.sample error (on render)', './src/exports/sample/ERROR.OnRender'),
    );
