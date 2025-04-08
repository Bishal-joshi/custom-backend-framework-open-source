import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { MigrationSnapshot } from "./MigrationSnapshot";
import { migrationFolderName } from "./constants";

export class MigrationHistory {
  migrationsSnapshotsLists: MigrationSnapshot[];
  migrationHistoryFilePath: string;
  constructor(HistoryFileName: string) {
    this.migrationHistoryFilePath = `${migrationFolderName}/${HistoryFileName}`; // Path to the migration history file

    const migrationsDir = path.dirname(this.migrationHistoryFilePath);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // check if the file exists, if not create it
    if (!fs.existsSync(this.migrationHistoryFilePath)) {
      fs.writeFileSync(this.migrationHistoryFilePath, "", "utf8");
    }
    // Read the file and parse the JSON data
    const fileContent = fs.readFileSync(this.migrationHistoryFilePath, "utf8");
    if (fileContent) {
      const parsedContent = JSON.parse(fileContent);
      this.migrationsSnapshotsLists = parsedContent || []; // Initialize migrations from file content
    }
    // Initialize migrations array  if file is empty
    else {
      this.migrationsSnapshotsLists = [];
    }
  }

  saveMigrationSnapshot(migration: MigrationSnapshot) {
    this.migrationsSnapshotsLists.push(migration);
    // Rewrite the migration history to the file, overwriting the existing content
    fs.writeFileSync(
      this.migrationHistoryFilePath,
      JSON.stringify(this.migrationsSnapshotsLists, null, 2),
      "utf8"
    );
  }
  getLatestMigrationSnapshot() {
    return this.migrationsSnapshotsLists[
      this.migrationsSnapshotsLists.length - 1
    ];
  }

  reverseLatestMigrationSnapshot() {
    const latestMigration = this.getLatestMigrationSnapshot();
    if (latestMigration) {
      // Remove the latest migration from the history
      this.removeLatestMigration();
      // Remove the migration file from the file system
      fs.unlinkSync(
        `${migrationFolderName}/${latestMigration.migrationFilename}`
      );
    } else {
      console.log("No migrations found to reverse.");
    }
  }

  removeLatestMigration() {
    this.migrationsSnapshotsLists.pop();
    // Rewrite the migration history to the file, overwriting the existing content
    fs.writeFileSync(
      this.migrationHistoryFilePath,
      JSON.stringify(this.migrationsSnapshotsLists, null, 2),
      "utf8"
    );
  }
}
