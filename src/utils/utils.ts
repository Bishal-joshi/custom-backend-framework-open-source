import { isEqual, sortBy } from "lodash";

export function normalizeMetadata(data: any[]) {
  return sortBy(data, "tableName").map((item) => ({
    ...item,
    columns: sortBy(item.columns, JSON.stringify), // Sort the columns as well
  }));
}

export function compareTwoMigrations(
  latest_migration: any[],
  previous_migration: any[]
): { new_table: any[]; removed_table: any[]; updated_table: any[] } {
  // Create a map for quick look-up of columns by table and column name
  const latest_map = latest_migration.reduce((acc, table) => {
    acc[table.tableName] = table.columns.reduce((colAcc, column) => {
      colAcc[column.columnName] = column;
      return colAcc;
    }, {});
    return acc;
  }, {});

  const previous_map = previous_migration.reduce((acc, table) => {
    acc[table.tableName] = table.columns.reduce((colAcc, column) => {
      colAcc[column.columnName] = column;
      return colAcc;
    }, {});
    return acc;
  }, {});

  // Tables that are new in the latest migration
  const new_table = latest_migration.filter(
    (latest) =>
      !previous_migration.some(
        (previous) => latest.tableName === previous.tableName
      )
  );

  // Tables that are removed in the latest migration
  const removed_table = previous_migration.filter(
    (previous) =>
      !latest_migration.some(
        (latest) => previous.tableName === latest.tableName
      )
  );

  // Tables present in both migrations but with different columns
  const same_table = latest_migration.filter((latest) =>
    previous_migration.some(
      (previous) =>
        latest.tableName === previous.tableName &&
        !isEqual(latest.columns, previous.columns)
    )
  );

  // Finding the differences in columns for tables that exist in both migrations
  const updated_table = same_table.map((same) => {
    const previous_columns = previous_map[same.tableName] || {};
    const latest_columns = latest_map[same.tableName] || {};

    const new_column = [];
    const removed_column = [];
    const updated_column = [];

    // Compare columns
    Object.keys(latest_columns).forEach((columnName) => {
      const latestColumn = latest_columns[columnName];
      const previousColumn = previous_columns[columnName];

      if (!previousColumn) {
        // Column is new
        new_column.push(latestColumn);
      } else {
        // Column exists in both, check if updated
        if (
          latestColumn.fieldType !== previousColumn.fieldType ||
          latestColumn.primaryKey !== previousColumn.primaryKey
        ) {
          updated_column.push(latestColumn);
        }
      }
    });

    // Check for removed columns
    Object.keys(previous_columns).forEach((columnName) => {
      if (!latest_columns[columnName]) {
        removed_column.push(previous_columns[columnName]);
      }
    });

    return {
      tableName: same.tableName,
      new_columns: new_column,
      removed_columns: removed_column,
      updated_columns: updated_column,
    };
  });
  //   console.log("New Tables:", new_table);
  //   console.log("Removed Tables:", removed_table);
  //   console.log("Column Differences:", updated_table);
  return {
    new_table,
    removed_table,
    updated_table,
  };
}
