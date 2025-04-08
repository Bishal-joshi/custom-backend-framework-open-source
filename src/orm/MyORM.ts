import { Pool } from "pg";
import { QueryHandler } from "./queryHandler/QueryHandler";
import { InsertBuilder } from "./queryBuilder/builders/insertBuilder";
import { UpdateBuilder } from "./queryBuilder/builders/updateBuilder";
import { DeleteBuilder } from "./queryBuilder/builders/deleteBuilder";
import { SelectBuilder } from "./queryBuilder/builders/selectBuilder";
import { PoolProvider } from "../provider/pool";
import { ModelProvider } from "../provider/models";

export class MyORM {
  constructor(pool: Pool, models: any[]) {
    QueryHandler.getInstance(pool); // set the pool in QueryHandler, we can use it in the query builder classes
    PoolProvider.getInstance(pool); // set the pool in PoolProvider,which will be used to provide pool in different classes (eg: migrationHandler)
    ModelProvider.getInstance(models); // set the models in ModelProvider, which will be used to provide models in different classes (eg: migrationHandler)
  }
  insert(tableName: string) {
    return new InsertBuilder(tableName);
  }
  update(tableName: string) {
    return new UpdateBuilder(tableName);
  }
  delete(tableName: string) {
    return new DeleteBuilder(tableName);
  }
  select(fields: string) {
    return new SelectBuilder(fields);
  }
}
