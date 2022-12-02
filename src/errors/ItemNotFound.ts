import { HttpException } from '../abstract/Exception';

export class ItemNotFound extends HttpException {
  public code: 440 = 440;
  public exception: string;
  public message: string;
  public extra: any;

  constructor(message: string, extra?: any, exception?: string) {
    super();
    this.message = message;
    this.exception = this.constructor.name || String(exception || '');
    this.extra = extra || undefined;
  }
}
