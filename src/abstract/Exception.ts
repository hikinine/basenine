export abstract class HttpException {
  code?: number;
  exception?: string;
  message?: string;
  extra?: any;
}
