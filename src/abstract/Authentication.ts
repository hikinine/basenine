export interface BaseAuthentication {
  me: BaseAuthenticationPayload;
}
export type BaseAuthenticationPayload = {
  privilege: number;
  id: string;
};
