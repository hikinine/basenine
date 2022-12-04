export * from "./abstract";
export { ApplicationContainer } from './container';
export * from "./decorators";
export * from "./errors";
export * from "./interface/entity";
export { ExpressHttpServer } from './server.express';

export type QueryOptions = { raw?: boolean }

export interface Returns<Response> {
  execute(...args: any[]): Response | Promise<Response>
} 