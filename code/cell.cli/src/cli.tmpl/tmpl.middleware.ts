import { fs, npm } from '../common';
import * as t from './types';

/**
 * Saves a template file.
 */
export function saveFile(
  args: {
    rename?: Array<{ from: string; to: string }>;
    done?: t.TemplateAfterMiddleware;
  } = {},
): t.TemplateMiddleware<t.ITemplateVariables> {
  return async (req, res) => {
    const { rename = [] } = args;
    const { dir } = req.variables;
    let target = fs.join(dir, req.path.target);

    rename
      .filter(item => target.endsWith(item.from))
      .forEach(item => {
        target = target.substr(0, target.length - item.from.length);
        target += item.to;
      });

    const message = `saving: ${target}`;
    res.alert({ message });

    await fs.ensureDir(fs.dirname(target));
    await fs.writeFile(target, req.buffer);

    res.done(args.done);
  };
}

/**
 * Run NPM install on the package.
 */
export function npmInstall(
  args: { done?: t.TemplateAfterMiddleware } = {},
): t.TemplateMiddleware<t.ITemplateVariables> {
  return async (req, res) => {
    const { dir } = req.variables;
    const message = `running NPM install...🌼`;
    res.alert({ message });

    await npm.install({ dir });

    res.done(args.done);
  };
}

/**
 * Processes a [package.json] file.
 */
export function processPackage(args: {
  filename: string;
  done?: t.TemplateAfterMiddleware;
}): t.TemplateMiddleware<t.ICellTemplateVariables> {
  return async (req, res) => {
    if (!req.path.source.endsWith(args.filename)) {
      return res.next();
    }

    // Get latest NPM versions.
    res.alert({ message: `Retrieving latest version information...` });

    const pkg = npm.pkg({ json: JSON.parse(req.text || '') });
    await pkg.updateVersions({
      filter: (name, version) => version === 'latest',
    });

    // Update the package JSON.
    res.alert({ message: 'Updating [package.json] file' });
    pkg.json.name = req.variables.name;

    // Finish up.
    res.text = pkg.toJson();
    res.done(args.done);
  };
}
