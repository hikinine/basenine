import { QueryNotAllowed } from '../errors/QueryNotAllowed';

type OrderByProps = 'asc' | 'desc';
type OrderByNested =
  | any
  | {
      [key: string]: OrderByProps;
    }
  | {
      [key: string]: OrderByProps;
    }[];
export interface QueryPagination {
  take?: number;
  skip?: number;
  orderBy?: string;
  direction?: OrderByProps;

  filter?: string;
  q?: string;
  in?: string;

  [key: string]: any;
}

export class Query {
  take?: number;
  skip?: number;
  orderBy?: OrderByNested;

  constructor(props?: {
    take?: number;
    skip?: number;
    orderBy?: string;
    direction?: OrderByProps;
    defaultOrderBy?: OrderByNested;
  }) {
    const allowedKeys = ['take', `filter`, 'skip', 'orderBy', `defaultWhere`, `defaultOrderBy`, 'direction'];

    Object.keys(props || {}).forEach((key) => {
      if (!allowedKeys.includes(key)) {
        throw new QueryNotAllowed(`Query não permitida. Key ${key} não permitida`);
      }
    });
    this.take = Number(props?.take) || 10;

    if (this.take > 100) this.take = 100;

    this.skip = Number(props?.skip) || undefined;

    this.orderBy = undefined;
    if (props?.orderBy) {
      this.orderBy = {};
      this.orderBy[props?.orderBy] = props?.direction || 'desc';
    }

    if (!this.orderBy) {
      this.orderBy = props?.defaultOrderBy || undefined;
    }
  }
}
