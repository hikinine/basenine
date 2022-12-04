import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor } from './../interface/container';

export type ProviderMetadata = {
  id: string;
  moduleGenerator: unknown;
};
export function Provider(moduleGenerator?: unknown) {
  return (constructor: Constructor) => {
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
