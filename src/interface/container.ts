
import { ControllerMetadata } from '../decorators/Controller';

export type IController = new (...args: any[]) => { handle: (...args: any[]) => any } ;
export type IService = new (...args: any[]) => { execute: (...args: any[]) => any | Promise<any> } ;

export type Dependencies = { 
  key: string;
  alias?: string[];
  instance: any
};
export type Route = ControllerMetadata & { controller: IController; isReady: boolean };
export type Enumerable<T> = T | T[];

export type Listeners = { eventName: string; id: string };
export type ApplicationContainerModules = any

export type Constructor = new (...args: any[]) => {}