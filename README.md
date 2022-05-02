# Thrafe

Pronounced like the name 'Rafe', as in:
> My uncle, Thrafe lives in the Cayman Islands.

This is a library that aims to make it simple and straightforward to make typesafe, multithreaded web applications (using [Typescript](https://www.typescriptlang.org/) and [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) -- hence the annoying name, ***Thrafe***: threading + typesafe. 

## Why?

When working on my [CommunicativeCode](https://github.com/p-buddy/CommunicativeCode) webapp, I found it tricky to use both Typescript and web workers for the following reasons. 

### Where / how should types fit it in?


### Bungling Bundling

On one side, it's completely unobvious how best to compile & bundle a web worker written in typescript down to a single javascript file so that it can then be executed as a worker in the browser, e.g.:

```js
const worker = new Worker('https://www.my-example-website.com/static/worker.js');
```

### Two-way communication

## Anatomy of a Thrafe Implementation

