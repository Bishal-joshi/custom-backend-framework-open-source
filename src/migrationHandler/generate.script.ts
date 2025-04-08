#!/usr/bin/env node

import { ModelProvider } from "../provider/models";
import { MigrationGenerator } from "./MigrationGenerator";

// migration.js (CommonJS version)
const glob = require("glob");
const path = require("path");

// Get current working directory
const cwd = process.cwd();

// 1. Load all .js files in the user's project (except node_modules)
const files = glob.sync(path.join(cwd, "**/*.js"), {
  ignore: "**/node_modules/**",
});

for (const file of files) {
  try {
    // Dynamically import the file, but it won't execute its top-level code unless it's invoked
    const module = require(file);

    // Optionally, check for specific exports that may indicate an automatic server start or side effects
    if (module && typeof module.startServer === "function") {
      console.log(
        `Module ${file} was imported, but the server won't start unless explicitly called.`
      );
    } else {
      console.log(`Module ${file} was imported successfully.`);
    }
  } catch (err) {
    console.error(`Failed to load ${file}:`, err.message);
  }
}

const args = process.argv.slice(2);
const nameArg = args.find((arg) => arg.startsWith("--name="));
const migrationName: string | null = nameArg ? nameArg.split("=")[1] : null;

if (!migrationName) {
  console.error("❌ Please provide a name with --name");
  process.exit(1);
}

console.log("Migration name:", migrationName);
const migrationGenerator = new MigrationGenerator(migrationName);

const models = ModelProvider.getModels().flat();
migrationGenerator.generateMigrations(...models);
process.exit(1);

// #!/usr/bin/env node

// import { ModelProvider } from "../provider/models";
// import { MigrationGenerator } from "./MigrationGenerator";

// // migration.js (CommonJS version)
// const glob = require("glob");
// const path = require("path");

// // Get current working directory
// const cwd = process.cwd();

// // 1. Load all .js files in the user's project (except node_modules)
// const files = glob.sync(path.join(cwd, "**/*.js"), {
//   ignore: "**/node_modules/**",
// });

// for (const file of files) {
//   try {
//     require(file); // dynamically run files so MyORM gets invoked
//   } catch (err) {
//     console.error(`Failed to load ${file}:`, err.message);
//   }
// }

// const args = process.argv.slice(2);
// const nameArg = args.find((arg) => arg.startsWith("--name="));
// const migrationName: string | null = nameArg ? nameArg.split("=")[1] : null;

// if (!migrationName) {
//   console.error("❌ Please provide a name with --name");
//   process.exit(1);
// }

// console.log("Migration name:", migrationName);
// const migrationGenerator = new MigrationGenerator(migrationName);

// const models = ModelProvider.getModels().flat();
// migrationGenerator.generateMigrations(...models);
// process.exit(1);

// // // Continue with the rest of your logic after the import
// // import { ModelProvider } from "../provider/models";
// // import { MigrationGenerator } from "./MigrationGenerator";
// // // Get the current working directory
// // const currentWorkingDir = process.cwd();

// // // Create an async function to handle dynamic imports
// // async function run() {
// //   try {
// //     // Dynamically import the index.js file
// //     await import(`${currentWorkingDir}/index.js`);

// // const args = process.argv.slice(2);
// // const nameArg = args.find((arg) => arg.startsWith("--name="));
// // const migrationName: string | null = nameArg ? nameArg.split("=")[1] : null;

// // if (!migrationName) {
// //   console.error("❌ Please provide a name with --name");
// //   process.exit(1);
// // }

// // console.log("Migration name:", migrationName);
// //     const migrationGenerator = new MigrationGenerator(migrationName);
// // const models = ModelProvider.getModels().flat();
// // migrationGenerator.generateMigrations(...models);
// //   } catch (err) {
// //     console.error("Error importing index.js:", err);
// //   }
// // }

// // // Execute the function
// // run();
