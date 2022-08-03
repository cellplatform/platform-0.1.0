import { fs, Npm, t } from '../common';

type M = t.TemplateMiddleware<t.ICellTemplateVariables>;
type D = t.TemplateAfterMiddleware;

/**
 * Saves a template file.
 */
export function saveFile(
  args: {
    rename?: { from: string; to: string }[];
    done?: D;
  } = {},
): M {
  return async (req, res) => {
    const { rename = [] } = args;
    const { dir } = req.variables;
    let target = fs.join(dir, req.path.target);

    rename
      .filter((item) => target.endsWith(item.from))
      .forEach((item) => {
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
 * Replace placeholder text with template variables.
 */
export function replaceText(args: { done?: D } = {}): M {
  return (req, res) => {
    res.replaceText(/__NAME__/g, req.variables.name);
    res.done(args.done);
  };
}

/**
 * Run NPM install on the package.
 */
export function npmInstall(args: { done?: D } = {}): M {
  return async (req, res) => {
    const { dir } = req.variables;
    const message = `installing modules...🌼`;
    res.alert({ message });

    await Npm.install({ dir });

    res.done(args.done);
  };
}

/**
 * Processes a [package.json] file.
 */
export function processPackage(args: { filename: string; done?: D }): M {
  return async (req, res) => {
    if (!req.path.source.endsWith(args.filename)) {
      return res.next();
    }

    // Get latest NPM versions.
    res.alert({ message: `Retrieving latest version information...` });

    const json = JSON.parse(req.text || '');
    const pkg = Npm.pkg({ json });
    await pkg.updateVersions({ filter: (name, version) => version === 'latest' });

    // Update the package JSON.
    res.alert({ message: 'Updating [package.json] file' });
    pkg.json.name = req.variables.name;

    // Finish up.
    res.text = pkg.toJson();
    res.done(args.done);
  };
}
