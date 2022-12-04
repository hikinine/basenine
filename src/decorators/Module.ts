import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor, IController, IService } from './../interface/container';

export type ModuleMetadata = {
  providers: any[];
  exports: [
     IController,
     IService
  ][];
};
export function Module(props: ModuleMetadata) {
  return (target: Constructor) => {
    Reflect.defineMetadata(MetadataKeys.Modules, props, target);
  };
}