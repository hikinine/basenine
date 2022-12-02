import { HttpException } from '../abstract/Exception';

export class InternalError extends HttpException {
  public code: 500 = 500;
  public exception: string;
  public message: string;
  public extra: any;

  constructor(message: string, extra?: any, exception?: string) {
    super();
    this.message = message;
    this.exception = this.constructor.name || exception;
    this.extra = extra || undefined;
  }
}
