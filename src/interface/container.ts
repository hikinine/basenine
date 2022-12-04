
import { ControllerMetadata } from '../decorators/Controller';

export interface IController { handle: (...args: any[]) => any };
export interface IService{ execute: (...args: any[]) => any }

export type Dependencies = {
  key: string;
  alias?: string[];
  instance: any
};
export type Route = ControllerMetadata & { controller: IController; isReady: boolean };
export type Enumerable<T> = T | T[];

export type Listeners = { eventName: string; id: string };
export type ApplicationContainerModules = any

export type Constructor = { new(...args: any[]): {} }