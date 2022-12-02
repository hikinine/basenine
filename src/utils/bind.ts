import { Controller } from '../interface/container';

export function bind(controller: Controller) {
  return controller.handle.bind(controller);
}
