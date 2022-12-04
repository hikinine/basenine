import { IController } from '../interface/container';

export function bind(controller: IController) {
  return controller.handle.bind(controller);
}
