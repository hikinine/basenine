import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';

export type ListenerMetadata = {
  id: string;
  eventName: string;
};
export function JobListener<T, K>(props: { eventName: T; options?: K }) {
  return (constructor: any) => {
    Reflect.defineMetadata(
      MetadataKeys.Events,
      {
        id: constructor.name,
        eventName: props.eventName,
      },
      constructor,
    );

    const originalMethod = constructor.prototype.handle;
    constructor.prototype.handle = async function (job: any, done: any) {
      try {
        await originalMethod.apply(this, [job, done]);
        done();
      } catch (error) {
        done(error);
      }
    };
  };
}
