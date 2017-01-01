import "reflect-metadata";
import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import {DecoratedRoute, RequestMethod} from "./route";

export interface IMiddleware {
    (ctx:Koa.Context, next?:() => any):any;
}

interface INestedDecoratedController {
    key:string
}

class NestedDecoratedController implements INestedDecoratedController {
    key:string;

    constructor(options:INestedDecoratedController) {
        this.key = options.key;
    }
}

export function useController(router:KoaRouter, controller:any):void {
    let controllerRouter:KoaRouter = Reflect.getMetadata('routing:router', controller);
    let controllerMiddleware:IMiddleware[] = Reflect.getMetadata('routing:middleware', controller);

    controllerRouter.use(...controllerMiddleware);

    let controllers:DecoratedRoute[] = Reflect.getMetadata('routing:nestedcontrollers', controller) || [];
    controllers.forEach(c => {
        useController(controllerRouter, controller[c.key]);
    });

    let routes:DecoratedRoute[] = Reflect.getMetadata('routing:routes', controller) || [];
    routes.forEach(r => {
        switch (r.method) {
            case RequestMethod.Get:
                controllerRouter.get(r.path, ...controller[r.key]);
                break;
            case RequestMethod.Post:
                controllerRouter.post(r.path, ...controller[r.key]);
                break;
            case RequestMethod.Put:
                controllerRouter.put(r.path, ...controller[r.key]);
                break;
            case RequestMethod.Patch:
                controllerRouter.patch(r.path, ...controller[r.key]);
                break;
            case RequestMethod.Delete:
                controllerRouter.delete(r.path, ...controller[r.key]);
                break;
            case RequestMethod.Any:
                controllerRouter.use(r.path, ...controller[r.key]);
                break;
        }
    });

    router.use(controllerRouter.routes(), controllerRouter.allowedMethods());
}

export function Controller(pathPrefix:string, ...middleware:IMiddleware[]) {
    return function(constructor:Function):void {
        let router = new KoaRouter();
        router.prefix(pathPrefix);

        Reflect.defineMetadata('routing:router', router, constructor.prototype);
        Reflect.defineMetadata('routing:middleware', middleware, constructor.prototype);
    };
}

export function NestedController() {
    return function(target:any, key:string):void {
        let controllers:NestedDecoratedController[] = [];
        if (Reflect.hasMetadata('routing:nestedcontrollers', target)) {
            controllers = Reflect.getMetadata('routing:nestedcontrollers', target);
        }
        controllers.push(new NestedDecoratedController({
            key: key,
        }));
        Reflect.defineMetadata('routing:nestedcontrollers', controllers, target);
    };
}
