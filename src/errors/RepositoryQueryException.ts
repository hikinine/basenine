import { HttpException } from '../abstract/Exception';

export class RepositoryQueryException extends HttpException {
  public code: 441 = 441;
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
