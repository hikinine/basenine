
import "reflect-metadata";
import { MetadataKeys } from './constants/metadata.keys';
import { IntervalMetadata } from './decorators/Interval';
import { ListenerMetadata } from './decorators/Listener';
import { ModuleMetadata } from './decorators/Module';
import { ProviderMetadata } from './decorators/Provider';
import { RepositoryMetadata } from './decorators/Repository';
import { InternalError } from './errors/InternalError';
import { ApplicationContainerModules, Dependencies, Route } from './interface/container';
import { ExpressHttpServer, InstallExpressOptions } from './server.express';
import { bind } from './utils/bind';

export class ApplicationContainer {

  bind(dependencies: Dependencies) {
    const { key, instance, alias } = dependencies;
    this.modules.set(key, { alias: alias || [], instance });
  }

  resolve<T extends unknown = any>(key: string | any): T {
    const moduleKey = typeof key === 'function' ? key.name : key;

    if (this.modules.has(moduleKey)) return this.modules.get(moduleKey)?.instance as T;

    for (const [$, module] of this.modules?.entries()) {
      if (typeof module.alias === 'object' && module.alias.includes(moduleKey)) {
        return module.instance as T;
      }
    }
    return null as T;
  }
  public exportContainerTo(some: any) {
    some.container = this;
    return this;
  }
  private installApplicationModules() {
    /**
     * ORDER:
     * First you should resolve every repository
     * Then resolve services
     * then controllers / intervals / events
     */
    for (const $module of this.applicationModules) {
      const metadata: ModuleMetadata = Reflect.getMetadata(MetadataKeys.Modules, $module);
      if (!metadata) return;

      metadata.providers.forEach((provider) => {
        const repositoryMetadata: RepositoryMetadata = Reflect.getMetadata(MetadataKeys.Repository, provider);
        if (repositoryMetadata) {
          this.installRepository(provider, repositoryMetadata);
        }
      });

      metadata.exports.forEach(([$controller, $service]) => {

        try {
          const serviceMetadata: ProviderMetadata = Reflect.getMetadata(MetadataKeys.Provider, $service);
          if (serviceMetadata) {
            this.installService($service, serviceMetadata, metadata.providers);
          }

          const metadataKeys = Reflect.getMetadataKeys($controller);
          const hasControllerMetadata = metadataKeys.length && metadataKeys.some((key) => this.allowedControllerKeys.includes(key))
          if (hasControllerMetadata) {
            this.installController($controller, $service, metadataKeys);
          }

          if (serviceMetadata && hasControllerMetadata) {
            if (!this.counter.hasOwnProperty(metadata.id)) {
              this.counter[metadata.id] = 0
            }
            this.counter[metadata.id]++
          }
        } catch (error: any) {
          this.failed.push({
            error,
            message: error?.message,
            $service,
            $controller,
            $module,
            metadata
          })
        }

      });
    }
    return this;
  }

  private installRepository(repository: any, metadata: RepositoryMetadata) {
    const instance = repository.getInstance();

    this.bind({
      instance,
      key: metadata.id,
      alias: [metadata.interface, metadata.shortId, metadata.alias],
    });
  }

  private installService(
    service: any,
    metadata: ProviderMetadata,
    moduleMetadata: ModuleMetadata['providers'],
  ) {
    const constructorArgs = [];
    const repository = {} as { [key: string]: unknown };

    for (const implementation of moduleMetadata) {
      const repositoryMetadata: RepositoryMetadata = Reflect.getMetadata(MetadataKeys.Repository, implementation);

      if (!repositoryMetadata) {
        return this.BadResolveDependency({ repositoryMetadata, implementation });
      }

      const { id, shortId } = repositoryMetadata;
      const resolvedDependency = this.resolve(id);

      if (!resolvedDependency) {
        return this.BadResolveDependency({ id, repositoryMetadata, implementation });
      }

      repository[shortId] = resolvedDependency;
    }

    constructorArgs.push(repository);
    const instance = Reflect.construct(service, constructorArgs);
    const instanceExists = this.resolve(instance.constructor.name);
    if (!instanceExists) {
      this.bind({
        instance,
        key: instance.constructor.name,
      });
    }
  }

  private installController(
    controller: any,
    $service: any,
    metadataKeys: string[],
  ) {
    const constructorArgs = [];
    const service = this.resolve($service);

    if (!service) return this.BadResolveDependency({ $service, controller });

    const serviceMetadata: ProviderMetadata = Reflect.getMetadata(MetadataKeys.Provider, service.constructor);

    if (!serviceMetadata) {
      return this.BadResolveDependency({ service });
    }

    constructorArgs.push(service);
    const instance = Reflect.construct(controller, constructorArgs);
    const alias = []

    if (metadataKeys.includes(MetadataKeys.Controller)) {
      const metadata = Reflect.getMetadata(MetadataKeys.Controller, controller);
      this.routes.push({ ...metadata, controller: instance });
    }
    if (metadataKeys.includes(MetadataKeys.Interval)) {
      const metadata = Reflect.getMetadata(MetadataKeys.Interval, controller);
      this.intervals.push(metadata);
    }
    if (metadataKeys.includes(MetadataKeys.Events)) {
      const metadata: ListenerMetadata = Reflect.getMetadata(MetadataKeys.Events, controller);
      metadata.alias.forEach(eventAlias => alias.push(eventAlias))
      alias.push(metadata.eventName)
    }

    this.bind({
      instance,
      key: instance.constructor.name,
      alias,
    });
  }

  private installIntervals() {
    async function assign(handler: any) {
      try {
        await handler()
      } catch (error) {
        return
      }
    }
    for (const interval of this.intervals) {
      const $module = this.resolve(interval.id);
      const boundedHandler = $module.handle.bind($module, interval.request)
      setInterval(async () => await assign(boundedHandler), interval.ms);
      if (interval.runAtStart) setTimeout(async () => await assign(boundedHandler), 0);
    }
    return this;
  }

  private installRoutes() {
    const sortRoutes = (route: Route) => (route.path.includes(':') ? 1 : -1);
    this.routes.sort(sortRoutes);
    for (const route of this.routes) {
      const { method, path, controller } = route;
      let { middlewares } = route;
      middlewares = middlewares || [];

      const handler = bind(controller);
      Object.defineProperty(handler, 'name', { value: controller.constructor.name });

      if (!route.isReady) {
        this.server.route[method](path, ...this.defaultMiddleware, ...middlewares, handler);
        route.isReady = true;
      }
    }

    this.server.app.use('/v1', this.server.route);

    return this;
  }
  private installDeveloperRoutes(endpoint?: string) {

    this.server.app.get(
      endpoint || "/developer-cli",
      (_, res) => res.render("pages/index")
    )
  }

  private free() {
    delete this?.applicationModules;
    delete this?.routes;
    return this;
  }

  private BadResolveDependency(args: any) {
    throw new InternalError('Mal formação no AutoImport. Não consegui resolver a dependência: ', args);
  }

  constructor(props: {
    applicationModules: any[],
    server?: {
      express: InstallExpressOptions,
      defaultMiddleware?: any[]
      developerCli?: {
        active: boolean,
        endpoint: string
      }
    },

    noIntervals?: boolean
  }) {
    this.applicationModules = props.applicationModules
    this.installApplicationModules();

    if (typeof props?.server?.defaultMiddleware === "object") {
      const { defaultMiddleware } = props.server
      this.defaultMiddleware = defaultMiddleware
    }

    if (!props?.noIntervals) {
      this.installIntervals();
    }
    if (props?.server) {
      this.server = new ExpressHttpServer(props.server?.express)
      this.installRoutes();
    }

    if (props?.server?.developerCli?.active) {
      this.installDeveloperRoutes(props.server.developerCli.endpoint);
    }


    this.free();
  }


   failed = []
  private applicationModules: any[]
  private counter = {} as { [key: string]: number }
  private defaultMiddleware = []
  private server: ExpressHttpServer
  private modules = new Map<string, { instance: ApplicationContainerModules; alias?: string[] }>();
  private routes = [] as Route[];
  private intervals = [] as IntervalMetadata[];
  private allowedControllerKeys = [
    MetadataKeys.Controller,
    MetadataKeys.HttpRoute,
    MetadataKeys.Interval,
    MetadataKeys.Events,
  ];
}
