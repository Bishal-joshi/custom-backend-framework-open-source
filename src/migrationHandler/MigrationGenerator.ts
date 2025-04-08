import "reflect-metadata";
import * as fs from "fs";
import { isEqual } from "lodash";
import { compareTwoMigrations, normalizeMetadata } from "../utils/utils";
import { MigrationHistory } from "./MigrationHistory";
import { MigrationSnapshot } from "./MigrationSnapshot";
import { migrationFolderName, migrationHistoryFileName } from "./constants";

export class MigrationGenerator {
  description: string;
  createdAt: Date;
  constructor(description: string) {
    this.description = description;
    this.createdAt = new Date();
  }

  /**
   * Generates SQL from a model class.
   * @param model Model class to generate SQL from
   * @returns
   */
  generateSqlFromModel(model: any): string {
    const tableName = Reflect.getMetadata("tableName", model);
    const columns = Reflect.getMetadata("columns", model);
    if (!columns || !tableName) {
      throw new Error("Not a valid model class.");
    }
    const columnDefinitions = columns.map((column: any) => {
      const columnType = column.fieldType;
      return column.primaryKey
        ? `${column.columnName} ${columnType} PRIMARY KEY`
        : `${column.columnName} ${columnType}`;
    });
    // Generate SQL for creating the table if not exists
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(
      ", "
    )});`;
    return sql;
  }
  /**
   *  * Generates SQL from an array of model classes.
   * @param models Array of model classes to generate SQL from
   * @returns
   */
  generateSqlFromModels(models: any[]): string {
    let sql = ""; // Initialize the SQL string
    models.forEach((model) => {
      const migrationSql = this.generateSqlFromModel(model);
      sql += migrationSql + "\n"; // Append each generated SQL statement
    });
    return sql;
  }

  generateSqlFromTableNameAndColumns(
    tableName: string,
    columns: any[]
  ): string {
    const columnDefinitions = columns.map((column: any) => {
      const columnType = column.fieldType;
      return column.primaryKey
        ? `${column.columnName} ${columnType} PRIMARY KEY`
        : `${column.columnName} ${columnType}`;
    });
    // Generate SQL for creating the table if not exists
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(
      ", "
    )});`;
    return sql;
  }
  generateSqlFromModelsWithHistory(
    models: any[],
    migrationHistory: MigrationHistory
  ): string {
    let sql = ""; // Initialize the SQL string

    const latestMigrationDescription =
      this.getMetadataDescriptionOfModels(models);

    const previousMigrationDescription =
      migrationHistory.getLatestMigrationSnapshot()?.metadataDescription || [];

    const { new_table, removed_table, updated_table } = compareTwoMigrations(
      latestMigrationDescription,
      previousMigrationDescription
    );

    console.log(new_table, removed_table, updated_table);

    // Generate SQL for new tables
    new_table.forEach((table) => {
      const tableName = table.tableName;
      const columns = table.columns;
      sql += this.generateSqlFromTableNameAndColumns(tableName, columns) + "\n"; // Append each generated SQL statement
    });
    // Generate SQL for removed tables
    removed_table.forEach((table) => {
      const tableName = table.tableName;
      sql += `DROP TABLE IF EXISTS ${tableName};\n`; // Append each generated SQL statement
    });

    // Generate SQL for updated tables
    updated_table.forEach((table) => {
      console.log(
        table.removed_columns,
        table.updated_columns,
        table.new_columns,
        "table"
      );
      const tableName = table.tableName;
      const new_column = table.new_columns;
      const removed_column = table.removed_columns;
      const updated_column = table.updated_columns;
      // Generate SQL for new columns
      new_column.forEach((column) => {
        sql += `ALTER TABLE ${tableName} ADD COLUMN ${column.columnName} ${column.fieldType};\n`; // Append each generated SQL statement
      });
      // Generate SQL for removed columns
      removed_column.forEach((column) => {
        sql += `ALTER TABLE ${tableName} DROP COLUMN ${column.columnName};\n`; // Append each generated SQL statement
      });
      // Generate SQL for updated columns
      updated_column.forEach((column) => {
        sql += `ALTER TABLE ${tableName} ALTER COLUMN ${column.columnName} TYPE ${column.fieldType};\n`; // Append each generated SQL statement
      });
    });

    return sql;
  }
  /**
   * Generates a migration file name based on the current date and time and the description.
   * @returns Migration file name
   */
  generateMigrationFileName(): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    return `migration_${this.description}_${timestamp}.sql`;
  }

  /**
   * Generates a migration file description.
   * @returns Migration file description
   */
  generateMigrationFileDescription(): string {
    const fileDesctription = `-- Migration: ${
      this.description
    }\n-- Created at: ${this.createdAt.toISOString()}\n`;
    return `${fileDesctription}`;
  }

  /**
   * Generates a migration file with SQL content.
   * @returns Migration file content
   */
  generateMigrationScript(...models: any[] | any): string {
    const fileDesctription = this.generateMigrationFileDescription();
    // Check if models are passed as an array or as individual arguments
    let sql = ""; // Initialize the SQL string
    // sql = this.generateSqlFromModels(models); // If multiple models are passed, generate SQL from them
    sql = this.generateSqlFromModelsWithHistory(
      models,
      new MigrationHistory(migrationHistoryFileName)
    ); // If multiple models are passed, generate SQL from them
    return `${fileDesctription}${sql}`;
  }

  /**
   * Generates a migration file with SQL content and writes it to the file system.
   * @returns Migration file content
   */
  generateMigrationFileWithSqlAndWriteToFile(...models: any[] | any): {
    fileContent: string;
    fileName: string;
  } {
    if (models.length === 0) {
      throw new Error("No models provided for migration generation.");
    }
    // Check if the folder exists, if not create it
    if (!fs.existsSync(migrationFolderName)) {
      fs.mkdirSync(migrationFolderName, { recursive: true });
    }
    const fileName = this.generateMigrationFileName();
    const fileContent = this.generateMigrationScript(...models);
    // Here you would write the content to a file using fs module
    fs.writeFileSync(`${migrationFolderName}/${fileName}`, fileContent, "utf8");
    return { fileContent, fileName }; // Return the content for testing purposes
  }

  /**
   * Gets the metadata description of a model class.
   * @param model Model class to get metadata from
   * @returns
   */
  getMetadataDescriptionOfModel(model: any): object {
    const tableName = Reflect.getMetadata("tableName", model);
    const columns = Reflect.getMetadata("columns", model);
    if (!columns || !tableName) {
      throw new Error("Not a valid model class.");
    }
    return { tableName, columns };
  }

  /**
   * Gets the metadata description of an array of model classes.
   * @param models Array of model classes to get metadata from
   * @returns
   * */
  getMetadataDescriptionOfModels(models: any[]): object[] {
    const metadataDescriptions = models.map((model) => {
      return this.getMetadataDescriptionOfModel(model);
    });
    return metadataDescriptions;
  }

  /**
   * Generates migrations for the provided model classes.
   * @param models Array of model classes to generate migrations for
   * @returns Migration file content
   */
  generateMigrations(...models: any[] | any) {
    if (models.length === 0) {
      throw new Error("No models provided for migration generation.");
    }
    // first check the history file if the migration already exists
    const migrationHistory = new MigrationHistory(migrationHistoryFileName);
    const latestMigration = migrationHistory.getLatestMigrationSnapshot();
    const modelMetadata = this.getMetadataDescriptionOfModels(models);
    // Check if the latest migration is empty or not
    if (latestMigration) {
      // if latest migration is not empty and the latest migration description is same as the model metadata then return
      if (
        isEqual(
          normalizeMetadata(latestMigration.metadataDescription),
          normalizeMetadata(modelMetadata)
        )
      ) {
        console.log("Migration already exists.");
        return;
      }
    }
    // Check if the migration folder exists, if not create it
    if (!fs.existsSync(migrationFolderName)) {
      fs.mkdirSync(migrationFolderName, { recursive: true });
    }
    const { fileContent, fileName } =
      this.generateMigrationFileWithSqlAndWriteToFile(...models);

    // Create a new migration snapshot
    const migrationSnapshot = new MigrationSnapshot(
      this.getMetadataDescriptionOfModels(models),
      fileName
    );
    // Add the migration snapshot to the history
    migrationHistory.saveMigrationSnapshot(migrationSnapshot);

    console.log("Migration file created successfully.");
    return fileContent; // Return the content for testing purposes
  }
}
