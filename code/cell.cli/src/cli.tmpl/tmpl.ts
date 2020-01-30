import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { cli, fs, log, Template } from '../common';
import * as middleware from './tmpl.middleware';
import * as t from './types';

export async function tmpl(args: { dir: string }) {
  // Prompt the user for which template to load.
  const tmplDir = fs.resolve(fs.join(__dirname, '../../tmpl'));
  const fsPrompt = cli.prompt.fs.paths(tmplDir, { pageSize: 10, all: false });
  const dir = (await fsPrompt.radio('template'))[0];

  // Prompt for module name.
  const name = await cli.prompt.text({ message: 'module name' });

  // NOTE: NPM does not include the `package.json` file in the bundle, so we name it
  //       something different to get it deployed.
  const rename = [{ from: 'pkg.json', to: 'package.json' }];

  const tmpl = Template
    // Prepare the template.
    .create(dir)
    .use(middleware.processPackage({ filename: 'pkg.json' }))
    .use(middleware.saveFile({ rename }))
    .use(middleware.npmInstall({ done: 'COMPLETE' }));

  /**
   * User input variables.
   */
  const variables: t.ICellTemplateVariables = {
    dir: fs.resolve(`./${name}`),
    name,
  };

  const alerts$ = tmpl.events$.pipe(
    filter(e => e.type === 'TMPL/alert'),
    map(e => e.payload as t.ITemplateAlert),
  );

  const task: cli.exec.ITask = {
    title: log.gray(`Create template: ${log.white(fs.basename(dir))}`),
    task: () =>
      new Observable(observer => {
        alerts$.subscribe(e => observer.next(e.message));
        (async () => {
          await tmpl.execute<t.ICellTemplateVariables>({ variables });
          observer.complete();
        })();
      }),
  };

  // Run the template generator.
  log.info();
  await cli.exec.tasks.run(task);

  // Finish up.
  log.info();
  log.info.gray(variables.dir);
  log.info();
}
