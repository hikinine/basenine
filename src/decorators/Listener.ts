import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor } from '../interface/container';

export type ListenerMetadata = {
  id: string;
  eventName: string;
  alias: string[];
  options: any
};
export function JobListener<T, K>(props: { eventName: T extends { name: string } ? T["name"] : string; options?: K }) {
  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Events,
      {
        id: constructor.name,
        eventName: props.eventName,
        alias: [
          props.eventName + "Controller",
          props.eventName + "Service",
        ],
        options: props.options
      },
      constructor,
    );

    const originalMethod = constructor.prototype.handle;
    Object.assign(constructor, { listernerOptions: props.options });
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
