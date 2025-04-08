# The Open-Source Backend Framework

This framework is a custom wrapper around Express.js, written in TypeScript.

Below is an overview of the design patterns employed in the creation of this custom backend framework:

# 1. Use of Decorators

One of the primary reasons for choosing TypeScript over JavaScript was the ability to utilize decorators.

## Why Are Decorators Used Here?

Decorators are employed to map custom models to their corresponding table types and columns. They facilitate the identification of models and columns by associating them with metadata.

Consider the implementation below:

```
src/orm/decorator.ts
```

## Decorators in the Framework

This file defines custom decorators that simplify database schema mapping within TypeScript.

Key Decorators

1. @Entity(tableName: string)

   ```
   Associates a class with a database table.
   ```

2. @PrimaryKey()

   ```
   Marks a property as the primary key of the table.

   Validates the property type and updates metadata accordingly.
   ```

3. @Column(columnName: string)

   ```
   Maps a property to a database column.

   Validates the property type and stores column metadata.
   ```

### Purpose

These decorators leverage TypeScript's metadata reflection to:

1. Define database schemas directly within the code.

2. Simplify ORM-like functionality for database integration.

Additionally, more decorators are used in the expressWrapper to associate methods with specific request types. You can find them in the following file:

```
src/expressWrapper/decorator
```

### @Post(path: string)

The @Post decorator is used to define HTTP POST routes for methods in a class. It ensures that the path starts with a / and attaches metadata to the method, specifying the HTTP method (POST) and the route path. This metadata is later used by the framework to register routes with the Express.js router, simplifying route management and keeping the code organized.

# 2. Migration Handler

The code in src/migrationHandler is designed to handle database migrations. Its primary responsibilities include generating and applying migrations.

The problem we are addressing here involves the following challenges:

1. Generating a SQL file every time we make changes to our models.

2. Tracking the SQL files, and knowing whether migrations have been generated or not.

3. Generating new migrations when a table is added, a column is added or removed, or any other structural changes occur.

4. Reversing migrations and tracking which migrations have been applied.

To tackle these challenges, we need to store the state of the migrations every time we generate one. To solve this, I have used the `Memento Design Pattern`.

Below is an overview of the classes and their responsibilities:

### Key Classes

1. MigrationGenerator

   The MigrationGenerator class is responsible for generating the SQL files that correspond to the changes in the model. This class ensures that every modification in the model results in an updated migration file.

2. MigrationHistory

   Since we need to track the history of generated SQL files, the MigrationHistory class serves to store and maintain the history of applied migrations. It keeps a record of the migrations that have been generated, as well as their associated metadata (e.g., date, table modifications).

3. MigrationSnapshot

   The MigrationSnapshot class is responsible for taking a snapshot of the current migration state and saving it to the migration history. Each time a new migration is generated, this class ensures that a snapshot of the current model structure is captured and stored.

How It Works

The MigrationGenerator uses the MigrationSnapshot to take a snapshot of the current model state after generating a new migration.

The MigrationHistory stores the state of the migrations, keeping track of which migrations have been generated and when.

The MigrationSnapshot interacts with the MigrationHistory to store the current migration state and any changes to the migration history.

This setup allows us to:

1. Track the history of generated migrations.

2. Apply and revert migrations as needed.

3. Generate new migrations based on changes in the database schema.

Here, `apply.script.ts` and `generate.script.ts` script in migrationHandler is used to generate the sql file and apply the migrations. which is mapped in script of package.json to run from cli.

# 3. Custom ORM builder

We have used a Builder Pattern for generating SQL queries in an object-oriented way. This pattern allows constructing SQL queries step by step, improving readability, maintainability, and flexibility in how queries are built and executed. Here's an explanation of the system:

### Overview

The MyORM class acts as the main interface for building SQL queries, and the QueryBuilder classes (InsertBuilder, UpdateBuilder, DeleteBuilder, SelectBuilder etc) are responsible for constructing the individual SQL queries. The WhereBuilder class handles filtering conditions in SELECT queries.

### Key Components

#### MyORM:

This is the entry point to build SQL queries. It provides methods like insert(), update(), delete(), and select() to start building different types of SQL queries.

#### InsertBuilder, UpdateBuilder, DeleteBuilder, SelectBuilder:

These classes are responsible for generating SQL queries for inserting, updating, deleting, and selecting data, respectively. Each builder class provides specific methods for modifying the query and adding parameters.

#### WhereBuilder:

This class is used specifically for adding WHERE conditions to a SELECT query. It supports multiple conditions such as equality, inequality, greater than, less than, etc., and allows for building complex queries with AND or OR conditions.

#### How It Works

Insert Operation: The insert() method from MyORM returns an InsertBuilder, which allows adding values to the query. Once all values are added, the query can be executed.

#### Update Operation:

The update() method returns an UpdateBuilder, where fields to update are specified using set(), and conditions for updating are specified using where().

#### Delete Operation:

The delete() method returns a DeleteBuilder, allowing for the creation of DELETE queries.

#### Select Operation:

The select() method returns a SelectBuilder, and the from() method adds a FROM clause. The WhereBuilder is used to add conditions for filtering the data.

# 4. Singleton pattern used in provider (models provider, pool provider)

To ensure efficient resource management, the framework uses the **Singleton Pattern** for managing shared resources like the database connection pool. A single instance of the pool object is created during the initialization or registration of the custom ORM. This instance is then injected into other classes (e.g., ORM class, migration generator class) that require access to the same pool object.

#### Benefits:

- Ensures only one instance of the pool object exists throughout the application.
- Simplifies resource sharing across different components.
- Improves performance by avoiding redundant object creation.

### 5. Chain of Responsibility Pattern for Route Mapping

The framework uses the **Chain of Responsibility Pattern** to manage the mapping of API routes and middleware. This pattern allows defining a chain of execution, specifying the order in which middleware and routes are processed. By implementing this pattern, the framework ensures a structured and flexible routing flow, enabling developers to define what comes next in the execution chain and streamline the routing logic.
