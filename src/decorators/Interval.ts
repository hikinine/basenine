import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor } from '../interface/container';

export type IntervalMetadata = {
  id: string;
  ms: number;
  runAtStart?: boolean;
  request?: {
    body: any;
    params: { [key: string]: string };
  };
};
export function Interval(ms: number, props?: Pick<IntervalMetadata, 'runAtStart' | 'request'>) {
  const runAtStart = typeof props?.runAtStart === 'boolean' ? props.runAtStart : true;

  const request = props?.request || {};
  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Interval,
      {
        id: constructor.name,
        ms,
        runAtStart,
        request,
      },
      constructor,
    );
  };
}
