import { HttpException } from '../abstract/Exception';

export class UnprocessableEntityException extends HttpException {
  public code: 422 = 422;
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
