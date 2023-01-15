import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor, IController, IService } from './../interface/container';
import { CatcherHandler } from './Catch';

export type ModuleMetadataProps = {
  catcher?: CatcherHandler,
  providers: any[];
  exports: [
     IController,
     IService
  ][];
};
export type ModuleMetadata = ModuleMetadataProps & { id: string }
export function Module(props: ModuleMetadataProps) {
  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Modules, 
      {
        id: constructor.name,
        ...props
      }, 
      constructor
      );
  };
}