# Koa Router Decorators

Convenience decorators for [koa-router](https://github.com/alexmingoia/koa-router/tree/master). Adds concept of controller classes, with route methods on the class.

## Installation

```sh
$ npm install --save @edcarroll/koa-router-decorators
```

## Quickstart

Import the necessary decorators and the `useController` helper function from the library:

```typescript
import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import {Controller, Get, IMiddleware, useController} from "@edcarroll/koa-router-decorators";

const app = new Koa();
const router = new KoaRouter();
```

Create your first controller:

```typescript
@Controller('/')
class RootController {
    @Get('/')
    public helloWorld:IMiddleware[] = [
        async ctx => {
            ctx.body = "hello, world!";
        }];
}
```

Connect the controller to the root router and you're good to go!

```typescript
useController(router, new RootController());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(20000);
```

## Decorators

### @Controller(pathPrefix:string, ...middleware?:IMiddleware[])

Marks class as router controller. To make use of the controller either connect it directly to a `KoaRouter` instance with `useController` or nest it within an existing controller using `@NestedController`.

Routes are defined on the controller itself, as properties, decorated with `@Route` or its equivalent convenience decorators. The `pathPrefix` property is used to prefix each route within the controller's path with a specified string. The `middleware` property is a spread array of middleware that when set are applied to all of the child routes of the controller and its nested controllers.

#### Path Prefix Usage

```typescript
@Controller('/demo')
class DemoController {
    @Get('/')
    public demo:IMiddleware[] = [async ctx => ctx.body = "demo"];
}

// GET /demo/ : 200 : "demo"
```

#### Middleware Usage

```typescript
import {Controller, Get, Post} from "@edcarroll/koa-router-decorators";
import {loggingMiddleware, authMiddleware} from "...";

@Controller('/demo', loggingMiddleware, authMiddleware)
class DemoController {
    @Get('/')
    public demo:IMiddleware[] = [async ctx => ctx.body = "demo"];

    @Post('/')
    public example:IMiddleware[] = [async ctx => ctx.body = "example"];
}

// GET  : /demo : 401
// POST : /demo : 401
```

### @NestedController()

Nested controllers are how complex controllers can be built up from a single root controller. When you have defined your 'sub-controller' class and decorated it with `@Controller`, place an of it instance within the parent controller with the `@NestedController` decorator.

#### Usage

```typescript
import {Controller, NestedController, Get} from "@edcarroll/koa-router-decorators";

@Controller('/nested')
class SubController {
    @Get('/route')
    public nested:IMiddleware[] = [async ctx => ctx.body = "nested"];
}

@Controller('/demo')
class DemoController {
    @NestedController()
    public nestedController = new SubController();
}

// GET : /demo/nested/route : 200 : "nested"
```

### @Route(method:RequestMethod, path:string)

Defines a route on the controller. To set up a route, use this to decorate an array of `IMiddleware`. The array of middleware will be attached to the controller, using the provided method and path, and are executed in order.

Route parameters work as expected, e.g. `/people/:id` will set `ctx.params.id`.

#### Usage

```typescript
import {Controller, Route, RequestMethod} from "@edcarroll/koa-router-decorators";

@Controller('/')
class RootController {
    @Route(RequestMethod.Get, '/example')
    public exampleRoute:IMiddleware[] = [
        async (ctx, next) => {
            // 1. This middleware is called first
            ctx.status == 204; // false

            await next(); // 2. We then await downstream

            // 4. Control flows back upstream
            ctx.status == 204; // true
        },
        async ctx => {
            ctx.status = 204; // 3. This middleware is called, changing the status then returning
        }];
}

// GET : /example : 204
```

### @Get(path:string), @Put(...), @Post(...)...

These are convenience decorators, and are each shorthand for `@Route(RequestMethod.[Get|Put|Post|...], path)`

#### Usage

```typescript
@Controller('/')
class DemoController {
    @Get('/example')
    @Post('/example')
    public example:IMiddleware[] = [async ctx => ctx.body = "hello, world!"];
}
```

## API

### useController(router:KoaRouter, controller:any):void

Helper function that connects a controller to a `KoaRouter` instance. Usually you will only call this function once, when your application starts up.

#### Usage

```typescript
import * as KoaRouter from "koa-router";
import {Controller} from "@edcarroll/koa-router-decorators";

const router = new KoaRouter();

@Controller('/')
class RootController {}

useController(router, new RootController());

app.use(router.routes());
app.use(router.allowedMethods());
```