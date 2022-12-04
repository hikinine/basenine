import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor } from '../interface/container';

export type ListenerMetadata = {
  id: string;
  eventName: string;
};
export function JobListener<T, K>(props: { eventName: T; options?: K }) {
  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Events,
      {
        id: constructor.name,
        eventName: props.eventName,
      },
      constructor,
    );

    const originalMethod = constructor.prototype.handle;
    constructor.prototype.handle = async function (...args: any[]) {
      const [$, done] = args
      try {
        await originalMethod.apply(this, args);
        done();
      } catch (error) {
        done(error);
      }
    };
  };
}
