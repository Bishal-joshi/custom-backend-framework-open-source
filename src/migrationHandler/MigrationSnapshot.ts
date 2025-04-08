export class MigrationSnapshot {
  metadataDescription: object[];
  migrationFilename: string;
  createdAt: Date;
  constructor(metadataDescription: object[], migrationFilename: string) {
    this.migrationFilename = migrationFilename;
    this.metadataDescription = metadataDescription;
    this.createdAt = new Date();
  }
}
