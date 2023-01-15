import { Request, Response } from 'express';
import { Constructor } from '../interface/container';
import { MetadataKeys } from './../constants/metadata.keys';

export interface CatchMetadata {
  id: string
  exceptionHandler: any
}
export type CatcherHandler = (request?: Request, response?: Response, error?: unknown) => any | Promise<any>
export function Catch(handler: CatcherHandler) {

  return (constructor: Constructor) => {

    Reflect.defineMetadata(
      MetadataKeys.Catch,
      {
        id: constructor.name,
        exceptionHandler: handler
      },
      constructor
    )
  }
}