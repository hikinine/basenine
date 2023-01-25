import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";



export class SocketServer {

  constructor(public io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) { }
}
