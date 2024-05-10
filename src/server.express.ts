import cors from 'cors';
import express, { Express, Router } from 'express';
import http from "http";
import { join } from "path";
import { Server } from 'socket.io';
import { SocketServer } from './server.socket';
export interface InstallExpressOptions {
  jsonLimit?: string;
  urlencoded?: boolean;
  disableCors?: boolean;
  port?: number;
  mergeParams?: boolean
  corsOptions?: cors.CorsOptions | cors.CorsOptionsDelegate<cors.CorsRequest>;
  onReady?: () => void;
}

class ExpressHttpServer {
  public app: Express;
  public route: Router;
  public socket?: SocketServer

  constructor(options?: InstallExpressOptions, installSocket?: boolean) {
    const app = express();

    const server = http.createServer(app)

    if (installSocket) {
      const io = new Server(server, {
        cors: {
          origin: "*",
        }
      });
      this.socket = new SocketServer(io)
    }


    app.set('views', join(__dirname, '../views'))
    app.set('view engine', 'ejs');

    app.use(express.json({ limit: options?.jsonLimit || '50mb' }));
    app.use(express.urlencoded({ extended: options?.urlencoded || true }));

    if (!options?.disableCors) {
      app.use(cors(options.corsOptions));
    }

    server.listen(options?.port || 3000, options?.onReady);

    const route = Router({ mergeParams: typeof options.mergeParams === "boolean" ? options.mergeParams : true });
    this.app = app;
    this.route = route;
  }
}

export { ExpressHttpServer };

