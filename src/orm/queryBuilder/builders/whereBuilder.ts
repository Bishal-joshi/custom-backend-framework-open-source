import { QueryHandler } from "../../queryHandler/QueryHandler";
import { QueryBuilder } from "../queryBuilder";

export class WhereBuilder extends QueryBuilder {
  private query: string;

  constructor(query: string, parameters: any[]) {
    super();
    this.query = query;
    this.parameters = parameters;
  }

  eq(column: string, value: any): WhereBuilder {
    return this.addCondition(`${column} = $${this.parameters.length + 1}`, [
      value,
    ]);
  }

  neq(column: string, value: any): WhereBuilder {
    return this.addCondition(`${column} != $${this.parameters.length + 1}`, [
      value,
    ]);
  }

  gt(column: string, value: any): WhereBuilder {
    return this.addCondition(`${column} > $${this.parameters.length + 1}`, [
      value,
    ]);
  }

  lt(column: string, value: any): WhereBuilder {
    return this.addCondition(`${column} < $${this.parameters.length + 1}`, [
      value,
    ]);
  }

  like(column: string, value: any): WhereBuilder {
    return this.addCondition(`${column} LIKE $${this.parameters.length + 1}`, [
      value,
    ]);
  }

  in(column: string, values: any[]): WhereBuilder {
    const placeholders = values
      .map((_, i) => `$${this.parameters.length + i + 1}`)
      .join(", ");
    return this.addCondition(`${column} IN (${placeholders})`, values);
  }

  notIn(column: string, values: any[]): WhereBuilder {
    const placeholders = values
      .map((_, i) => `$${this.parameters.length + i + 1}`)
      .join(", ");
    return this.addCondition(`${column} NOT IN (${placeholders})`, values);
  }

  andGroup(callback: (qb: WhereBuilder) => void): WhereBuilder {
    this.query += " AND (";
    callback(this);
    this.query += ")";
    return this;
  }

  orGroup(callback: (qb: WhereBuilder) => void): WhereBuilder {
    this.query += " OR (";
    callback(this);
    this.query += ")";
    return this;
  }

  private addCondition(condition: string, params: any[]): WhereBuilder {
    if (this.query.includes("WHERE")) {
      this.query += ` AND ${condition}`;
    } else {
      this.query += ` WHERE ${condition}`;
    }
    this.parameters.push(...params);
    return this;
  }

  async execute(): Promise<object | object[]> {
    const result = await QueryHandler.getInstance().query(
      this.query,
      this.parameters
    );
    return result.rows;
  }
}
