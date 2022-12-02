import 'reflect-metadata';
import { MetadataKeys } from '../constants/metadata.keys';

export interface OpenAPIResponse {
  response: unknown;
}
export type DocumentationMetadata = {
  id: string;
  description: string;
  summary: string;
};
export function OpenAPI(props: { summary: string; description: string }) {
  return (constructor: any) => {
    Reflect.defineMetadata(
      MetadataKeys.Documentation,
      {
        id: constructor.name,
        description: props.description,
        summary: props.summary,
      },
      constructor,
    );
  };
}
