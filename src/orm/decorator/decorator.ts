import "reflect-metadata"; // Enables metadata reflection

export function Entity(tableName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata("tableName", tableName, constructor);
  };
}

const columnTypeMap: Record<string, string> = {
  String: "VARCHAR(255)",
  Number: "INT",
  Boolean: "BOOLEAN",
  Date: "DATETIME",
  Object: "JSON",
  Array: "JSON",
};

function ensureColumnsMetadata(target: Object) {
  if (!Reflect.hasMetadata("columns", target.constructor)) {
    Reflect.defineMetadata("columns", [], target.constructor);
  }
  return Reflect.getMetadata("columns", target.constructor);
}

function addOrUpdateColumnMetadata(
  columns: any[],
  columnName: string,
  fieldType: string,
  isPrimaryKey: boolean = false
) {
  const existingColumn = columns.find(
    (column: any) => column.columnName === columnName
  );
  if (existingColumn) {
    existingColumn.fieldType = fieldType;
    if (isPrimaryKey) existingColumn.primaryKey = true;
  } else {
    columns.push({ columnName, fieldType, primaryKey: isPrimaryKey });
  }
}

export function PrimaryKey() {
  return function (target: Object, propertyKey: string) {
    // console.log(`PrimaryKey decorator applied on: ${propertyKey}`);
    const columns = ensureColumnsMetadata(target);

    const fieldType = Reflect.getMetadata("design:type", target, propertyKey);
    const fieldTypeName = fieldType?.name;

    if (!columnTypeMap[fieldTypeName]) {
      throw new Error(
        `Unsupported field type for PrimaryKey: ${fieldTypeName}`
      );
    }

    addOrUpdateColumnMetadata(
      columns,
      propertyKey,
      columnTypeMap[fieldTypeName],
      true
    );
    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}

export function Column(columnName: string) {
  return function (target: Object, propertyKey: string) {
    const columns = ensureColumnsMetadata(target);

    const fieldType = Reflect.getMetadata("design:type", target, propertyKey);
    const fieldTypeName = fieldType?.name;

    if (!columnTypeMap[fieldTypeName]) {
      throw new Error(`Unsupported field type for Column: ${fieldTypeName}`);
    }

    addOrUpdateColumnMetadata(
      columns,
      columnName,
      columnTypeMap[fieldTypeName]
    );
    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}
