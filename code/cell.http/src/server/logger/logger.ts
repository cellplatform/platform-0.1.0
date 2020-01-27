import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { t, log } from '../common';

/**
 * Start listening to the given micro-service and log activity.
 */
export function start(args: { app: t.IMicro; debounce?: number }) {
  const { app, debounce = 500 } = args;

  const hr$ = new Subject();
  hr$.pipe(debounceTime(debounce)).subscribe(e => {
    log.info.gray('━'.repeat(70));
  });

  app.request$.subscribe(e => {
    log.info(logRequest(e));
    hr$.next();
  });
}

const methodColor = (method: t.HttpMethod) => {
  const is = (methods: t.HttpMethod[]) => methods.includes(method);
  if (is(['GET', 'HEAD'])) {
    return log.green;
  }
  if (is(['POST', 'PUT'])) {
    return log.green;
  }
  if (is(['PATCH'])) {
    return log.yellow;
  }
  if (is(['DELETE'])) {
    return log.red;
  }
  return log.white;
};

const logRequest = (req: t.IMicroRequest) => {
  const MAX = {
    PREFIX: 'DELETE'.length,
    URL: 60,
  };
  const url = shorten(req.url, MAX.URL);
  let prefix = `${req.method}${' '.repeat(MAX.PREFIX)}`.substring(0, MAX.PREFIX);
  prefix = methodColor(req.method)(prefix);
  return log.gray(`${prefix} ${url}`);
};

const shorten = (text: string, max: number) => {
  return text.length < max ? text : `${text.substring(0, max)}...`;
};
