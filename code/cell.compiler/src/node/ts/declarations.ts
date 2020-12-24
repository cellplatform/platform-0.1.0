import { fs, exec, ProgressSpinner } from '../common';
import { CompilerOptions } from 'typescript';

export type TsConfig = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

export function compileDeclarations(args: { tsconfig: string }) {
  return {
    async run(outfile: string, options: { silent?: boolean } = {}) {
      outfile = fs.resolve(outfile);

      // Prepare [tsconfig].
      const path = fs.resolve(args.tsconfig);

      const json = (await fs.readJson(path)) as TsConfig;
      json.compilerOptions = json.compilerOptions || {};
      delete json.compilerOptions.outDir;
      json.compilerOptions.emitDeclarationOnly = true;
      json.compilerOptions.outFile = outfile;

      // outfile = fs.resolve(outfile);

      console.log('tsconfig', json);

      const project = fs.join(fs.dirname(path), 'tsconfig.tmp');
      await fs.writeFile(project, JSON.stringify(json, null, '  '));

      const spinner = ProgressSpinner({ label: 'building typescript' });
      if (!options.silent) spinner.start();
      const cmd = exec.command(`tsc --project ${project}`);
      spinner.stop();

      const res = await cmd.run({ cwd: fs.dirname(path), silent: true });
      console.log('res', res);

      // Finish up.
      return { tsconfig: json, outfile };
    },
  };
}
