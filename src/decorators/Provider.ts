import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';

export type ProviderMetadata = {
  id: string;
  moduleGenerator: unknown;
};
export function Provider(moduleGenerator: unknown) {
  return (constructor: any) => {
    Reflect.defineMetadata(
      MetadataKeys.Provider,
      {
        id: constructor.name,
        moduleGenerator,
      },
      constructor,
    );
  };
}
