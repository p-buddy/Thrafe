# Thrafe

Pronounced like the name 'Rafe', as in:
> My uncle, Thrafe lives in the Cayman Islands.

This is a library that aims to make it simple and straightforward to make typesafe, multithreaded web applications (using [Typescript](https://www.typescriptlang.org/) and [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) -- hence the annoying name, ***Thrafe***: threading + typesafe. 

## Why?

When working on my [CommunicativeCode](https://github.com/p-buddy/CommunicativeCode) webapp, I found it tricky to use both Typescript and web workers for reasons I outline further below.

## Usage

### Worker code
```ts
```

### Component code

#### Svelte

```ts
```

#### React

...TBD...

#### Vue

...TBD...

## How it works

...TBD...

## State of things

## Why? (cont.)

### Where / how should types fit it in?


### Bungling Bundling

On one side, it's completely unobvious how best to compile & bundle a web worker written in typescript down to a single javascript file so that it can then be executed as a worker in the browser, e.g.:

```js
const worker = new Worker('https://www.my-example-website.com/static/worker.js');
```

Bundlers are supporting this in different ways, which I think is already confusing.

[Vite's solution](https://vitejs.dev/guide/features.html#web-workers) seems pretty neat, [webpack seems to be working on it]() (not immediately clear to me how this works with typescript), but regardless I don't like how any of the solutions I've seen. 

### Two-way communication

## Anatomy of a Thrafe Implementation

