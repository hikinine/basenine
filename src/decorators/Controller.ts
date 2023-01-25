import { Request, Response } from 'express';
import 'reflect-metadata';
import { HttpException } from '../abstract/Exception';
import { MetadataKeys } from '../constants/metadata.keys';
import { AuthorizationException } from '../errors';
import { Constructor } from '../interface/container';
import { CatchMetadata } from './Catch';

type Pathname = `/${string}`;

export type ControllerMetadata = {
  id: string;
  role: number;
  middlewares?: any[];
  errors: any[]
  method: 'post' | 'put' | 'get' | 'delete' | 'patch';
  path: Pathname;
  statusCode: number;
};
export type HttpInterceptorMetadata = {
  method: 'post' | 'put' | 'get' | 'delete' | 'patch';
};

type HttpMethods = { [key in HttpInterceptorMetadata['method']as Capitalize<key>]: Pathname };

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>> }[Keys];

type http = RequireOnlyOne<HttpMethods>;

function handleErrorResponse(response: Response, result: any) {
  if (result instanceof HttpException) {
    response.status(result?.code || 400).json(result);
  } else if (result instanceof Error) {
    response.status(500).json({
      message: result?.message,
      error: result
    });
  } else {
    response.status(500).json({
      message: result?.message,
      error: result
    });
  }
}

export function Controller(props: {
  middlewares?: any[];
  role?: number;
  headers?: { [key: string]: string };
  endpoint?: http;
}) {
  const errors = []
  let statusCode = 200;
  let method = '';
  if (typeof props.endpoint.Get === 'string') {
    statusCode = 200;
    method = 'get';
  }
  if (typeof props.endpoint.Patch === 'string') {
    statusCode = 201;
    method = 'patch';
  }
  if (typeof props.endpoint.Delete === 'string') {
    statusCode = 201;
    method = 'delete';
  }
  if (typeof props.endpoint.Put === 'string') {
    statusCode = 201;
    method = 'put';
  }
  if (typeof props.endpoint.Post === 'string') {
    statusCode = 201;
    method = 'post';
  }
  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Controller,
      {
        id: constructor.name,
        role: props?.role || 0,
        middlewares: props?.middlewares || [],
        statusCode,
        method,
        errors,
        path: Object.values(props.endpoint)[0],
      },
      constructor,
    );

    const catchMetadata: CatchMetadata = Reflect.getMetadata(MetadataKeys.Catch, constructor);
    constructor.prototype.customExceptionHandler = catchMetadata
      ? catchMetadata.exceptionHandler
      : null;

    const originalMethod = constructor.prototype.handle;
    constructor.prototype.statusCode = statusCode;
    constructor.prototype.authorization = { level: props?.role || 0 };
    constructor.prototype.handle = async function (request: Request, response: Response) {
      try {
        if (props.role) {
          if (this.authorization?.level > 0 && request?.body?.me?.privilege < this.authorization.level) {
            throw new AuthorizationException(
              'Você não tem permissão para acessar esse fluxo. Level necessário: ' + this.authorization.level + '.',
            );
          }
        }

        const controllerResponse = await originalMethod.apply(this, [request, response]);

        if (!response?.status)
          return controllerResponse;

        if (response.headersSent) { return }

        return response.status(this?.statusCode || 200).json(controllerResponse);
      } catch (error: any) {

        if (!constructor.prototype.customExceptionHandler) {
          // try one more time, since order of declaration of decorators matters,
          // ensure that if order is declared wrong, give one more try to find catchmetadata
          const hasMetadata: CatchMetadata = Reflect.getMetadata(MetadataKeys.Catch, constructor);

          constructor.prototype.customExceptionHandler = hasMetadata
            ? hasMetadata.exceptionHandler
            : "some-not-defined-value";
        }

        return typeof constructor.prototype.customExceptionHandler === "function"
          ? await constructor.prototype.customExceptionHandler(request, response, error)
          : handleErrorResponse.call(this, response, error)
      }
    }
  };
};
