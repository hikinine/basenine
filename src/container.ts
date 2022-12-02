import { BaseController } from './abstract/Controller';
import { BaseRepository } from './abstract/Repository';
import { Service } from './abstract/Service';
import { MetadataKeys } from './constants/metadata.keys';
import { IntervalMetadata } from './decorators/Interval';
import { ModuleMetadata } from './decorators/Module';
import { ProviderMetadata } from './decorators/Provider';
import { RepositoryMetadata } from './decorators/Repository';
import { InternalError } from './errors/InternalError';
import { ApplicationContainerModules, Dependencies, Route } from './interface/container';
import { ExpressHttpServer } from './server.express';
import { bind } from './utils/bind';

export class ApplicationContainer {
  constructor(private applicationModules: any[], private server: ExpressHttpServer) {}

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

  public installApplicationModules() {
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
          this.installRepository(provider as typeof BaseRepository, repositoryMetadata);
        }
      });

      metadata.exports.forEach(([$, $service]) => {
        const serviceMetadata: ProviderMetadata = Reflect.getMetadata(MetadataKeys.Provider, $service);

        if (serviceMetadata) {
          this.installService($service, serviceMetadata, metadata.providers);
        }
      });

      metadata.exports.forEach(([$controller, $service]) => {
        const metadataKeys = Reflect.getMetadataKeys($controller);
        if (metadataKeys.length && metadataKeys.some((key) => this.allowedControllerKeys.includes(key))) {
          this.installController($controller, $service, metadataKeys);
        }
      });
    }
    return this;
  }

  private installRepository(repository: typeof BaseRepository, metadata: RepositoryMetadata) {
    const context = metadata?.contextPrisma ? {} : undefined;
    const instance = repository.getInstance(context);

    this.bind({
      instance,
      key: metadata.id,
      alias: [metadata.interface, metadata.shortId],
    });
  }

  private installService(
    service: typeof Service<unknown, unknown>,
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

    constructorArgs.push({ repository });
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
    controller: typeof BaseController,
    $service: typeof Service<unknown, unknown>,
    metadataKeys: string[],
  ) {
    const constructorArgs = [];
    const service = this.resolve($service);

    if (!service) return this.BadResolveDependency({ $service, controller });

    const serviceMetadata: ProviderMetadata = Reflect.getMetadata(MetadataKeys.Provider, service.constructor);

    if (!serviceMetadata) {
      return this.BadResolveDependency({ service });
    }

    constructorArgs.push({ service });
    const instance = Reflect.construct(controller, constructorArgs);

    this.bind({
      instance,
      key: instance.constructor.name,
      alias: [],
    });

    if (metadataKeys.includes(MetadataKeys.Controller)) {
      const metadata = Reflect.getMetadata(MetadataKeys.Controller, controller);
      this.routes.push({ ...metadata, controller: instance });
    }
    if (metadataKeys.includes(MetadataKeys.Interval)) {
      const metadata = Reflect.getMetadata(MetadataKeys.Interval, controller);
      this.intervals.push(metadata);
    }
  }

  public installIntervals() {
    for (const interval of this.intervals) {
      const { id, ms, request, runAtStart } = interval;
      const $module = this.resolve(id);
      setInterval($module.handle.bind($module, request), ms);
      if (runAtStart) setTimeout($module.handle.bind($module, request), 0);
    }
    return this;
  }

  public installRoutes() {
    const sortRoutes = (route: Route) => (route.path.includes(':') ? 1 : -1);
    this.routes.sort(sortRoutes);
    for (const route of this.routes) {
      const { method, path, controller } = route;
      let { middlewares } = route;
      middlewares = middlewares || [];

      const handler = bind(controller);
      Object.defineProperty(handler, 'name', { value: controller.constructor.name });

      if (!route.isReady) {
        this.server.route[method](path, ...middlewares, handler);
        route.isReady = true;
      }
    }

    this.server.app.use('/v1', this.server.route);

    return this;
  }

  public exportContainerTo(some: any) {
    some.container = this;
    return this;
  }

  public free() {
    delete this?.applicationModules;
    delete this?.routes;
    return this;
  }

  private BadResolveDependency(args: any) {
    throw new InternalError('Mal formação no AutoImport. Não consegui resolver a dependência: ', args);
  }

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
