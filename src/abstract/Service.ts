import { AuthorizationException } from '../errors/AuthorizationException';
import { BaseAuthenticationPayload } from './Authentication';
import { DTOValidation } from './DTOValidation';

export type ServiceDispatcher = { service: typeof Service<unknown, unknown>; dto: DTOValidation };
export type InjectableDependencies<InjectedRepositories> = {
  repository: InjectedRepositories;
};

export class Service<InjectedRepositories, Response> {
  protected repository: InjectedRepositories;

  private authorization: {
    level: number;
  };

  protected ensureAuthorityPermission(dto: DTOValidation & { me: BaseAuthenticationPayload }) {
    if (this.authorization.level > 0 && dto.me.privilege < this.authorization.level) {
      throw new AuthorizationException('Você não tem permissão para acessar esse fluxo.');
    }
  }
  protected setAuthorization(props: { level: number }) {
    this.authorization = props;
  }
  public injectionOverride(props: { repository: InjectedRepositories }) {
    this.repository = props.repository;
  }
  constructor(props: InjectableDependencies<InjectedRepositories>) {
    this.repository = props.repository;
  }

  async execute(dto: DTOValidation): Promise<Response> {
    return {} as Response;
  }
}
