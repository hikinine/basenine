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

    const originalMethod = constructor.prototype.handle;
    
    constructor.prototype.handle = async function (socket: any) {
      try {
        const { event, payload } = await originalMethod.apply(this, [socket]);
        socket.emit(event, payload)
      } catch (error) {
        socket?.emit?.("error", error)
      }
    };
  };
}
