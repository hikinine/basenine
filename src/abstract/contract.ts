import {
  AuthenticationException,
  AuthorizationException,
  InvalidQueryException,
  ItemNotFound,
  RepositoryQueryException,
  UnprocessableEntityException,
  ValidationException,
} from '../errors';
import { QueryNotAllowed } from '../errors/QueryNotAllowed';

export interface Many<Entity> {
  total: number;
  payload: Entity[];
}
export type Response<T> = T;
export type Errors<T> =
  | T
  | AuthorizationException
  | AuthenticationException
  | QueryNotAllowed
  | UnprocessableEntityException
  | ValidationException
  | RepositoryQueryException
  | ItemNotFound
  | InvalidQueryException;
