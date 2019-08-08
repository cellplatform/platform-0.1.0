import { NeDb } from '@platform/fsdb.nedb';
import { take } from 'rxjs/operators';

import { IMongoStoreArgs, MongoStore } from '../store';

export type IMongoDbArgs = IMongoStoreArgs;

export class MongoDb {
  public static create(args: IMongoDbArgs) {
    const store = MongoStore.create(args);
    const db = NeDb.create({ store });
    db.dispose$.pipe(take(1)).subscribe(() => store.dispose());
    return db;
  }

  private constructor() {}
}
