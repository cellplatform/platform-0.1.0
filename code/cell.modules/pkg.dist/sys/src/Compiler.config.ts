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
        .expose('./net.sys', './src/exports/sys/Sys.Net')

        .expose('./DEV.net.sys', './src/exports/sys/DEV.Sys.Net')
        .expose('./DEV.fs.sys', './src/exports/sys/DEV.Sys.Fs')
        .expose('./DEV.crdt.data.sys', './src/exports/sys/DEV.Sys.Data.Crdt')
        .expose('./DEV.json.data.sys', './src/exports/sys/DEV.Sys.Data.Json')
        .expose('./DEV.web.runtime.sys', './src/exports/sys/DEV.Sys.Runtime.Web')
        .expose('./DEV.ui.web.runtime.sys', './src/exports/sys/DEV.Sys.Runtime.Web.UI')
        .expose('./DEV.dev.ui.sys', './src/exports/sys/DEV.Sys.UI.Dev')
        .expose('./DEV.doc.ui.sys', './src/exports/sys/DEV.Sys.UI.Doc')
        .expose('./DEV.primitives.ui.sys', './src/exports/sys/DEV.Sys.UI.Primitives')
        .expose('./DEV.video.ui.sys', './src/exports/sys/DEV.Sys.UI.Video')

        .expose('./DEV_SAMPLE.error (on module load)', './src/exports/sample/ERROR.OnModuleLoad')
        .expose('./DEV_SAMPLE.error (on render)', './src/exports/sample/ERROR.OnRender'),
    );
