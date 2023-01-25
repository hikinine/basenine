import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';
import { Constructor } from '../interface/container';

export type SocketMetadata = {
  id: string;
  on: `/${string}`
  
};
export function Socket(props: {
  on: `/${string}`
}) {

  return (constructor: Constructor) => {
    Reflect.defineMetadata(
      MetadataKeys.Socket,
      {
        id: constructor.name,
        on: props.on
      },
      constructor,
    );

  };
}
