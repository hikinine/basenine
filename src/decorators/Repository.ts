import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';

export type RepositoryMetadata = {
  id: string;
  interface: string;
  shortId: string;
  contextPrisma?: boolean;
};

export function formatRepository(key: string) {
  let id = '';
  for (let i = 0; i < key.length; i++) {
    id += !(key.charCodeAt(i) < 97 && i > 0) ? key.charAt(i).toLowerCase() : '_' + key.charAt(i).toLowerCase();
  }
  return id;
}

export function Repository(props: { contextPrisma?: boolean; interface: string }) {
  return (constructor: any) => {
    Reflect.defineMetadata(
      MetadataKeys.Repository,
      {
        id: constructor.name,
        interface: props.interface,
        shortId: formatRepository(props.interface.replace('Repository', '')),
        contextPrisma: props?.contextPrisma,
      },
      constructor,
    );
  };
}
