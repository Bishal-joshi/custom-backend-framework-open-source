type StartsWithSlash<Path extends string> = Path extends `/${string}`
  ? Path
  : never;

export function Post<Path extends string>(path: StartsWithSlash<Path>) {
  return function (target: any, methodName: string) {
    Reflect.defineMetadata(
      "route",
      { method: "POST", path },
      target,
      methodName
    );
  };
}
