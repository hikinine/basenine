import { BaseController } from '../abstract/Controller';
import { BaseRepository } from '../abstract/Repository';
import { Service as IService } from '../abstract/Service';
import { ControllerMetadata } from '../decorators/Controller';

export type Controller = { handle: (...args: any[]) => {} };
export type Service = IService<unknown, unknown>;

export type Dependencies = {
  key: string;
  alias?: string[];
  instance: BaseController | Service | BaseRepository;
};
export type Route = ControllerMetadata & { controller: Controller; isReady: boolean };
export type Enumerable<T> = T | T[];

export type Listeners = { eventName: string; id: string };
export type ApplicationContainerModules = BaseController<Service> | Service | BaseRepository;
