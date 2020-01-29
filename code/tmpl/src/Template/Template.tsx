import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { fs, fsPath, isBinaryFile, R, value } from '../common';
import {
  IExecuteTemplate,
  ITemplateAlert,
  ITemplateEvent,
  ITemplateFile,
  ITemplateResponse,
  ITemplateSource,
  IVariables,
  TemplateFilter,
  TemplateMiddleware,
  TemplatePathFilter,
} from '../types';
import { TemplateRequest } from './TemplateRequest';

export type SourceTemplateArg =
  | ITemplateSource
  | ITemplateSource[]
  | Template
  | Template[]
  | string
  | string[];

export type ITemplateArgs = {
  sources?: ITemplateSource[];
  filters?: TemplateFilter[];
  processors?: TemplateMiddleware[];
};

export type Handler<V extends IVariables = {}> = TemplateMiddleware<V> & {
  pathFilters?: TemplatePathFilter[];
};

/**
 * Represents a set of template files to transform.
 */
export class Template {
  /**
   * Creates a new template-plan.
   */
  public static create(source?: SourceTemplateArg) {
    const tmpl = new Template({});
    return source ? tmpl.add(source) : tmpl;
  }

  /**
   * Fields.
   */
  private readonly _disposed$ = new Subject();
  private readonly _events$ = new Subject<ITemplateEvent>();

  public isDisposed = false;
  public readonly disposed$ = this._disposed$.pipe(share());
  public readonly events$ = this._events$.pipe(takeUntil(this.disposed$), share());

  /**
   * Constructor.
   */
  private constructor(args: ITemplateArgs) {
    const { sources, filters, processors } = args;
    this.config.sources = sources || this.config.sources;
    this.config.filters = filters || this.config.filters;
    this.config.processors = processors || this.config.processors;
  }

  /**
   * Disposes of the template.
   */
  public dispose() {
    this.isDisposed = true;
    this._disposed$.next();
  }

  /**
   * Creates a clone of the Template.
   */
  public clone(args: ITemplateArgs = {}) {
    return new Template({
      sources: args.sources || this.config.sources,
      processors: args.processors || this.config.processors,
      filters: args.filters || this.config.filters,
    });
  }

  /**
   * Internal configuration.
   */
  private readonly config = {
    processors: [] as Handler[],
    sources: [] as ITemplateSource[],
    filters: [] as TemplateFilter[],
    cache: {
      files: undefined as ITemplateFile[] | undefined,
    },
  };

  /**
   * The source file patterns that make up this template.
   */
  public get sources() {
    return this.config.sources;
  }

  /**
   * Adds a new template source (pointer to it's directory/files).
   */
  public add(source: SourceTemplateArg) {
    let sources: ITemplateSource[] = [...this.sources];

    const list = Array.isArray(source) ? source : [source];
    list.forEach(item => {
      if (item instanceof Template) {
        return (sources = [...sources, ...item.sources]);
      }
      if (typeof item === 'string') {
        return (sources = [...sources, { dir: item }]);
      }
      return (sources = [...sources, item]);
    });

    sources = R.uniq(sources);
    return this.clone({ sources });
  }

  /**
   * Filter the set of files.
   */
  public filter(fn: TemplateFilter) {
    const filters = [...this.config.filters, fn];
    return this.clone({ filters });
  }

  /**
   * Register a template processor.
   */
  public use<V extends IVariables = {}>(fn: TemplateMiddleware<V>): Template;

  /**
   * Register a template processor with a path filter.
   */
  public use<V extends IVariables = {}>(
    pathFilter: TemplatePathFilter | TemplatePathFilter[],
    fn: TemplateMiddleware<V>,
  ): Template;

  /**
   * Register a template processor (implementation).
   */
  public use(arg1: any, arg2?: any): Template {
    // Wrangle the processor function.
    const fn: Handler = typeof arg2 === 'function' ? arg2 : arg1;
    if (!fn) {
      throw new Error(`A template processor function must be specified`);
    }

    // Build the list of path-filters (may be none).
    let pathFilter: TemplatePathFilter[] = [];
    if (arg1 instanceof RegExp || Array.isArray(arg1)) {
      const list: TemplatePathFilter[] = Array.isArray(arg1) ? arg1 : [arg1];
      pathFilter = list.filter(filter => filter instanceof RegExp);
    }
    fn.pathFilters = pathFilter;

    // Add to list.
    const processors = [...this.config.processors, fn];
    return this.clone({ processors });
  }

  /**
   * Generates the set of files (cached).
   */
  public async files(options: { cache?: boolean } = {}) {
    // Look for cached value.
    const cache = value.defaultValue(options.cache, true);
    if (cache && this.config.cache.files) {
      return this.config.cache.files;
    }

    // Lookup files.
    const wait = this.sources.map(source => getFiles(source));
    let files = value.flatten(await Promise.all(wait)) as ITemplateFile[];

    // Remove duplicates with "overriden" files.
    // NB: The duplicate files from templates added AFTER earlier templates
    //     override the earlier template files.
    const exists = (file: ITemplateFile, list: ITemplateFile[]) =>
      list.findIndex(f => f.source === file.source) > -1;
    files = files
      .reverse()
      .reduce((acc, next) => (exists(next, acc) ? acc : [...acc, next]), [] as ITemplateFile[])
      .reverse();

    // Apply any filters.
    const filters = this.config.filters;
    files =
      filters.length === 0 ? files : files.filter(file => filters.every(filter => filter(file)));

    // Finish up.
    this.config.cache.files = files;
    return files;
  }

  /**
   * Runs the execution pipeline.
   */
  public async execute<V extends IVariables = {}>(
    args: {
      variables?: V;
      cache?: boolean;
    } = {},
  ) {
    const { cache, variables = {} } = args;
    const processors = this.config.processors;
    if (processors.length === 0) {
      return;
    }

    // Prepare.
    const files = await this.files({ cache });
    const events$ = this._events$;
    const payload: IExecuteTemplate = { files };
    events$.next({ type: 'TMPL/execute/start', payload });

    // Run the processor pipe-line.
    const wait = files.map(file => runProcessors({ processors, file, variables, events$ }));

    // Finish up.
    await Promise.all(wait);
    events$.next({ type: 'TMPL/execute/complete', payload });
  }
}

/**
 * INTERNAL
 */
async function getFiles(source: ITemplateSource) {
  const { dir, pattern = '**', targetDir: targetPath } = source;
  let base = fsPath.resolve(dir);

  if (!(await fs.pathExists(base))) {
    return [];
  }

  const formatPath = (path: string) => path.substr(base.length);

  const toTarget = (path: string) => {
    path = formatPath(path);
    path = targetPath ? fsPath.join(targetPath, path) : path;
    return path;
  };

  const toFile = async (path: string) => {
    const file: ITemplateFile = {
      base,
      source: formatPath(path),
      target: toTarget(path),
      isBinary: await isBinaryFile(path),
    };
    return file;
  };

  // Check whether a single-file has been specified.
  const stats = await fs.lstat(base);
  if (stats.isFile()) {
    if (source.pattern) {
      let error = '';
      error += `A full file-path was specified as the 'dir' and a glob 'pattern' was given. `;
      error += `Can only be one of the other. `;
      error += `\npattern: '${source.pattern}', \ndir: '${source.dir}'`;
      throw new Error(error);
    }

    const file = fsPath.basename(base);
    base = fsPath.dirname(base);
    const path = fsPath.join(base, file);
    return [await toFile(path)];
  }

  // Look up the glob pattern.
  const path = fsPath.join(base, pattern);
  const paths = await fs.glob.find(fsPath.resolve(path), {
    dot: true,
    includeDirs: false,
  });
  const wait = paths.map(path => toFile(path));

  // Finish up.
  return Promise.all(wait);
}

function runProcessors(args: {
  variables: IVariables;
  processors: Handler[];
  file: ITemplateFile;
  events$: Subject<ITemplateEvent>;
}) {
  return new Promise(async (resolve, reject) => {
    const { processors, file, variables } = args;
    let isResolved = false;

    try {
      const runComplete = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };

      const buffer = await fs.readFile(fsPath.join(file.base, file.source));
      let text = file.isBinary ? undefined : buffer.toString();

      const res: ITemplateResponse = {
        next: () => runNext(),
        complete: () => runComplete(),
        done: next => (next === 'COMPLETE' ? runComplete() : runNext()),

        get text() {
          return text;
        },
        set text(value: string | undefined) {
          text = value;
        },

        replaceText(searchValue, replaceValue) {
          text = text === undefined ? undefined : text.replace(searchValue, replaceValue);
          return res;
        },

        alert<T extends ITemplateAlert>(payload: T) {
          args.events$.next({ type: 'TMPL/alert', payload });
          return this;
        },
      };

      const runProcessor = async (index: number) => {
        const fn = processors[index];
        if (isResolved || !fn) {
          return;
        }
        const { source, target } = file;
        const path = { source, target };
        const content = text || buffer;

        // If filters exist, ensure the path is a match.
        const filters = fn.pathFilters || [];
        if (filters.length > 0) {
          const isMatch = filters.some(filter => filter.test(path.target));
          if (!isMatch) {
            return runNext();
          }
        }

        // Invoke the handler.
        const req = new TemplateRequest({ path, content, variables });
        fn(req, res);
      };

      let index = 0;
      const runNext = () => {
        index++;
        if (index < processors.length) {
          runProcessor(index);
        } else {
          runComplete();
        }
      };

      runProcessor(0);
    } catch (error) {
      reject(error);
    }
  });
}
