import 'reflect-metadata';
import { Response } from '../abstract/contract';
import { BaseController } from '../abstract/Controller';
import { BaseRepository } from '../abstract/Repository';
import { Service } from '../abstract/Service';
import { MetadataKeys } from '../constants/metadata.keys';

export type ModuleMetadata = {
  providers: BaseRepository[];
  exports: [typeof BaseController<any>, typeof Service<unknown, Response<unknown>>][];
};
export function Module(props: ModuleMetadata) {
  return (target: any) => {
    Reflect.defineMetadata(MetadataKeys.Modules, props, target);
  };
}
