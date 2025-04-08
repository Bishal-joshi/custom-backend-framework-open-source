export abstract class QueryBuilder {
  protected parameters: any[] = [];
  abstract execute(): object;
}
