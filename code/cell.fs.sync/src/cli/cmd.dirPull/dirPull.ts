import { cli, HttpClient, defaultValue, fs, log, promptConfig, t } from '../common';
import { getPayload } from '../cmd.dirSync';
import * as util from '../util';

const gray = log.gray;

/**
 * Pull folder from remote.
 */
export async function dirPull(args: { dir: string; silent?: boolean }) {
  const { dir, silent = false } = args;

  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir });
  if (!config.isValid) {
    return;
  }

  const done = (completed: boolean, errors: cli.ITaskError[] = []) => {
    const ok = errors.length === 0;
    const res = { ok, completed, errors };
    return res;
  };

  const payload = await getPayload({ config, silent, delete: false });

  // Exit if payload not OK.
  if (!payload.ok) {
    return done(false);
  }

  // Filter on the list of files to pull.
  const pullList = payload.files.filter(item => item.status === 'DELETED');
  if (pullList.length === 0) {
    if (!silent) {
      log.info.green(`No files need pulling.`);
      log.info();
    }
    return done(true);
  }

  const toBytesString = (input?: number) => {
    const bytes = defaultValue(input, -1);
    return `${bytes < 0 ? '-' : fs.size.toString(bytes)}`;
  };

  if (!silent) {
    const table = log.table({ border: false });
    pullList.forEach(file => {
      const pull = gray(`pull`);
      const path = ` ${log.gray(file.path)}`;
      const size = log.white` ${toBytesString(file.remoteBytes)}`;
      table.add([pull, path, log.white(size)]);
    });
    log.info(table.toString());

    const total = pullList.length;
    let message = `pull ${total} ${util.plural.file.toString(total)}`;
    const size = util.toPayloadSize(pullList, { target: 'REMOTE' }).toString();
    message = total === 0 ? message : `${message}, ${size}`;
    log.info();
    const res = await cli.prompt.list({ message, items: ['yes', 'no'] });
    log.info();
    if (res === 'no') {
      log.info.gray(`cancelled (no change).`);
      return done(false);
    }
  }

  const targetUri = config.target.uri;
  const client = HttpClient.create(config.data.host).cell(targetUri.toString());

  const tasks = cli.tasks();
  const addPullTask = (file: t.IFsSyncPayloadFile) => {
    const bytes = file.remoteBytes;
    const size = bytes < 0 ? '' : `(${toBytesString(bytes)})`;
    const title = gray(`pull ${log.green(file.path)} ${size}`);
    tasks.task(title, async () => {
      const res = await client.file.name(file.path).download();
      await fs.stream.save(file.localPath, res.body);
    });
  };

  // Execute pull.
  pullList.forEach(file => addPullTask(file));
  const res = await tasks.run({ concurrent: false, silent });
  if (!silent) {
    log.info();
  }

  // Finish up.
  return done(true, res.errors);
}
