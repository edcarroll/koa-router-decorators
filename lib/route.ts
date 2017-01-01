import "reflect-metadata";

export enum RequestMethod {
    Head,
    Options,
    Get,
    Put,
    Patch,
    Post,
    Delete,
    Any
}

export interface IDecoratedRoute {
    method:RequestMethod;
    path:string;
    key:string;
}

export class DecoratedRoute implements IDecoratedRoute {
    method:RequestMethod;
    path:string;
    key:string;

    constructor(options:IDecoratedRoute) {
        this.method = options.method;
        this.path = options.path;
        this.key = options.key;
    }
}

export function Route(method:RequestMethod, path:string) {
    return function(target:any, key:string):void {
        let routes:DecoratedRoute[] = [];
        if (Reflect.hasMetadata('routing:routes', target)) {
            routes = Reflect.getMetadata('routing:routes', target);
        }
        routes.push(new DecoratedRoute({ method, path, key }));
        Reflect.defineMetadata('routing:routes', routes, target);
    }
}

export function Head(path:string) {
    return Route(RequestMethod.Head, path);
}

export function Options(path:string) {
    return Route(RequestMethod.Options, path);
}

export function Get(path:string) {
    return Route(RequestMethod.Get, path);
}

export function Put(path:string) {
    return Route(RequestMethod.Put, path);
}

export function Post(path:string) {
    return Route(RequestMethod.Post, path);
}

export function Patch(path:string) {
    return Route(RequestMethod.Patch, path);
}

export function Delete(path:string) {
    return Route(RequestMethod.Delete, path);
}