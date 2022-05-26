# Thrafe

Pronounced like the name [Rafe](https://en.wikipedia.org/wiki/Rafe_(name)#:~:text=Rafe), as in:
> My uncle, Thrafe lives in the Cayman Islands.

This is a library that aims to make it simple and straightforward to make typesafe, multithreaded web applications (using [Typescript](https://www.typescriptlang.org/) and [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) -- hence the annoying name, ***Thrafe***: threading + typesafe. 

## Why?

When working on my [CommunicativeCode](https://github.com/p-buddy/CommunicativeCode) webapp, I found it tricky to use both Typescript and web workers for reasons I outline further below.

Additionally, existing awesome worker libraries like [Comlink](https://github.com/GoogleChromeLabs/comlink) and [workway](https://github.com/WebReflection/workway) didn't make it easy to accomplish the twoway message passing I needed (i.e. I wanted the main thread to talk to the web worker at will, and vice versa):

> MainThread ⇄ Worker

## A little terminology

## Usage

### Architecture Definition

This can go in its own `.ts` file, or at the top of the worker file, or wherever you want really! It's just a type definition, so will be [transpiled]() away.

An architecture consists of 5 things:

#### 1. **Thread Nanme**:
A [string literal type definition](https://www.typescriptlang.org/docs/handbook/literal-types.html#string-literal-types) that defines what this thread should be referred to as, and utlimately the name of the file that is created by the [thrafe generator](https://github.com/p-buddy/Thrafe/blob/main/src/generation/generator.ts)
#### 2. **_To Worker Thread_ Events Enum**: 
[`const enum`](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums) defining the events where the **MAIN THREAD** calls into a worker thread
#### 3. **_To Worker Thread_ Message Structure Definition**:
blah blah blah
#### 4. **_To Main Thread_ Events Enum**:
[`const enum`](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums) defining the events where the **WORKER THREAD** calls into the main thread
#### 5. **_To Main Thread_ Message Structure Definition**:
blah blah blah

```ts
```

### Worker File

### Main Thread

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

