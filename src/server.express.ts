import cors from 'cors';
import express, { Express, Router } from 'express';
import { join } from "path";
export interface InstallExpressOptions {
  jsonLimit?: string;
  urlencoded?: boolean;
  disableCors?: boolean;
  port?: number;
  mergeParams?: boolean
  onReady?: () => void;
}

class ExpressHttpServer {
  public app: Express;
  public route: Router;

  constructor(options?: InstallExpressOptions) {
    const app = express();

    app.set('views', join(__dirname, '../views'))
    app.set('view engine', 'ejs');

    app.use(express.json({ limit: options?.jsonLimit || '50mb' }));
    app.use(express.urlencoded({ extended: options?.urlencoded || true }));

    if (!options?.disableCors) {
      app.use(cors());
    }

    app.listen(options?.port || 3000, options?.onReady);

    const route = Router({ mergeParams: typeof options.mergeParams === "boolean" ? options.mergeParams :  true });
    this.app = app;
    this.route = route;
  }
}

export { ExpressHttpServer };
