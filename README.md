# Thrafe

Pronounced like the name 'Rafe', as in:
> My uncle, Thrafe lives in the Cayman Islands.

This is a library that aims to make it simple and straightforward to make typesafe, multithreaded web applications (using [Typescript](https://www.typescriptlang.org/) and [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) -- hence the annoying name, ***Thrafe***: threading + typesafe. 

## Why?

When working on my [CommunicativeCode](https://github.com/p-buddy/CommunicativeCode) webapp, I found it tricky to use both Typescript and web workers. 

On one side, it's completely unobvious how best to compile & bundle a web worker written in typescript down to a single javascript file so that it can then be executed as a worker in the browser, e.g.:

```js
const worker = new Worker('https://www.my-example-website.com/static/worker.js');
```

Secondly, though the message passing structure of web workers is amazing in its flexibility, that flexibility of course comes at a cost.

When you invetably make a programming mistake, the web worker 'framework' will try its best to do what you asked (even if it makes no sense). When that happens and things probably go wrong, the web worker will either error out spectacularly or, worse, silently. Just as with javascript's [footgun](https://en.wiktionary.org/wiki/footgun) qualities, typescript to the rescue!

But how should I set up my types to make writing workers easy and readable? See section [Anatomy of a Thrafe Implementation](##Anatomy-of-a-Thrafe-Implementation)

## Anatomy of a Thrafe Implementation

