// * * ModelProvider is a singleton class that manages models for migrations.
// * * It ensures that only one instance of the class is created and used throughout the application.
// * * It is used to provide the models to other classes when needed
export class ModelProvider {
  private static modelProvider: ModelProvider;
  private models: any;
  private constructor(...models: any[]) {
    this.models = models;
  }
  static getInstance(models?: any[]): ModelProvider {
    if (!ModelProvider.modelProvider && models) {
      ModelProvider.modelProvider = new ModelProvider(...models);
    }
    return this.modelProvider;
  }
  static getModels(): any[] | any {
    if (!ModelProvider.modelProvider) {
      throw new Error("Models not initialized. Call getInstance() first.");
    }
    return ModelProvider.modelProvider.models;
  }
}
