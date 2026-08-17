---
layout: post.njk
title: "Design Patterns: Singleton"
date: 2021-03-09
tags: ["post", "Design Patterns", "JavaScript"]
permalink: /2021/design-patterns-singleton/
---

This series of posts covers the patterns presented in the classic book "[Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)." Here I break down the patterns and show examples in modern JavaScript.

The Singleton pattern is a fairly simple concept.  A Singleton is a class that protects itself from being instantiated multiple times.  Basically, you would use a Singleton for a global object used in many places but should only be created once.

Singletons are a good place to store variables that need to remain global.  Wrapping global variables in a Singleton helps declutter namespace and helps to control access to these variables.  Accessing and manipulating variables through a controlled Singleton interface can help reduce bugs created by protecting variables used in multiple places throughout a program.

Reducing global variables is always a worthy goal, so Singletons are best used sparingly, but there is so often some need for some global information that getting familiar with this pattern will be useful.

As I mentioned before, the Singleton's main feature is that it includes a way to limit the number of instances that can be created of a given object.  In JavaScript, there are a few ways to manage this, of which we will discuss three,  IIFE, classes, and modules.

## IIFE

The Immediately Invoked Function Expression or module is the classic way of solving this problem in JavaScript.  With an IIFE, you can set up a globally available object that cannot be instantiated in any other way.  The basic pattern looks like this:

```js
const mySingleton = (function(){
   const object = {}
   // set up object here

   return object
})(
```

There are a few downsides to this method, though, that may warrant using something else.  First, this will be called, and the object will be created when the program initially runs, so it won't do if you need to fetch some data or get some user input before creating this object.  Second, with a more evolved version of this pattern, you can bake in some more interesting access methods.  For instance,  you could create a Singleton that allows you to create and manage multiple instances that are still controlled and still have protected access.

## Classes

The Gang of Four wrote the original Design Patterns book primarily with C++ (and a little Smalltalk).  There are some differences between what you can do in C++ and JavaScript in your classes, and because of that, native JS classes might not be the best option for your Singletons.

Classically, Singletons protect themselves from being instantiated multiple times by forcing users to access it through a special function instead of the usual `new MyObject()`.

In this example, the class stores it's single instance in `this._instance` and the appropriate way to access it is through the static method `Singleton.instance()`

```js
//this does not protect against users just doing new Singleton()
class Singleton {
  constructor(className) {
    this._instance = null
    this.number = 0
  }

  static instance() {
    if (!this._instance) {
      this._instance = new Singleton(this)
    }
    return this._instance
  }

  iterate() {
    this.number ++
    console.log(`the number is ${this.number}`)
  }
}

const singleton = Singleton.instance()
singleton.iterate() // the number is 1
singleton.iterate() // the number is 2
singleton.iterate() // the number is 3
singleton.iterate() // the number is 4

console.log('another instance:')
this new instance should actually reference the original instead of creating a new one
const secondSingleton = Singleton.instance()
secondSingleton.iterate() // the number is 5
secondSingleton.iterate() // the number is 6
```

The big issue here is that in JavaScript we don't have a good way to disallow  users from just doing `new Singleton()` wherever they want in their code.  Other languages allow you to protect or override the constructor to stop that, but in JS we have to get a little tricky.

One (admittedly silly) way to do this is by forcing the use of a passcode to instantiate the singleton.  In the following example, anyone can still technically do `new Singleton()` but unless they provide the correct `methodOfAccess` as a parameter it will fail and throw an error encouraging the use of the correct method.  Obviously, this isn't real protection and I"m not sure I'd actually recommend it.

```js
class Singleton {
  constructor(methodOfAccess) {
    if (methodOfAccess !== 'instanceMethod') {
      throw new Error('Do not instantiate new Singletons.  Use the Singleton.instance() method to access.')
    }
    this._instance = null
    this.number = 0
  }

  static instance() {
    if (!this._instance) {
      this._instance = new Singleton('instanceMethod')
    }
    return this._instance
  }

  iterate() {
    this.number ++
    console.log(`the number is ${this.number}`)
  }
}

const singleton = Singleton.instance()
singleton.iterate()
singleton.iterate()
singleton.iterate()
singleton.iterate()

console.log('another instance:')
const secondSingleton = Singleton.instance()
secondSingleton.iterate()
secondSingleton.iterate()

console.log('this should error lol')
const thirdSingleton = new Singleton()
thirdSingleton.iterate()
```

The benefit to using a class here is that you can be more creative with how you instance and create your Singletons.  Imagine a game where some player data is kept in a Singleton, maybe some configuration options such as a control-scheme or online username.  If you decide that your game would be better as a two-player game, you'll need to get more creative with your singleton.

One creative option is to keep the singleton, but allow clients to create multiple instances that are still controlled by the Singleton.  This example does that by letting users pass in a name or id into the `instance` function.

```
//this does not protect against users just doing new Singleton()
class Singleton {
  constructor() {
    this.number = 0
  }

  static instance(name) {
    if (!this._instance) {
      this._instance = {}
    }
    if (!this._instance[name]) {
      this._instance[name] = new Singleton()
    }
    return this._instance[name]
  }

  iterate() {
    this.number ++
    console.log(`the number is ${this.number}`)
  }
}

const singleton = Singleton.instance('first')
singleton.iterate()
singleton.iterate()
singleton.iterate()
singleton.iterate()

console.log('another instance:')
const secondSingleton = Singleton.instance('second')
secondSingleton.iterate()
secondSingleton.iterate()

console.log('back to the first')
const thirdSingleton = Singleton.instance('first')
thirdSingleton.iterate()
thirdSingleton.iterate(
```

We still have the problem of safety here however, so we need a way to maintain the flexibility of access but not expose the class directly to users.

## RETURN OF THE IIFE

Of course, there are many ways of doing this, such as wrapping the class you intend to protect in an IIFE.  In the following example, the IIFE called 'Singleton' only returns an object with the `instance` function.  `Singleton.instance()` then returns an instance of a separate class that gets defined inside that IIFE.  Defining the class inside the IIFE means that you cannot instantiate that class outside of the IIFE, and since the IIFE is not a class itself, you can't re-instantiate the Singleton either.  The only way you can use it is by getting the protected instance with `Singleton.instance()`

```js
const Singleton = (function() {
  let _instance = null

  class ProtectedClass {
    constructor() {
      this.number = 0
    }

    iterate() {
      this.number ++
      console.log(`the number is ${this.number}`)
    }
  }

  function instance() {
    if (!_instance) {
      _instance = new ProtectedClass()
    }

    return _instance
  }

  return {instance}
})()

const singleton = Singleton.instance()
singleton.iterate()
singleton.iterate()

console.log('another instance:')
const secondSingleton = Singleton.instance()
secondSingleton.iterate()
secondSingleton.iterate()

const thisWillError = new ProtectedClass()
const thisWillAlsoError = new Singleton()
```

## Modules

[Native JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) are another great way to create Singletons if your project is set up in a way that supports them.  The idea is identical to the IIFE, and the code is much cleaner.  In any modern JavaScript project that requires a singleton, I would recommend using this pattern in conjunction with modules.

Modules allow you to use multiple files in your code, so this example is split in two.  The main feature is that we export a single function (`getSingletonInstance`) from the singleton.js module and then import it wherever we need to use it.  Just like the last IIFE example, the class that we create inside that module is protected because we are not exporting it.

```js
// index.js
import {getSingletonInstance} from './singleton.mjs'

const singleton = getSingletonInstance()

singleton.iterate()
singleton.iterate()
singleton.iterate()
```

```js
// singleton.js
let instance = null

export function getSingletonInstance() {
    if (!instance) {
      instance = new ProtectedClass()
    }

    return instance
}

class ProtectedClass {
    constructor() {
      this.number = 0
    }

    iterate() {
      this.number ++
      console.log(`the number is ${this.number}`)
    }
}
```

In the end, this has been a pretty long post to describe a pattern that is actually rather simple in concept and should be used sparingly.  However, I suspect there are cases in almost any codebase where something like this would be useful and definitely safer than just using some global variables, so don't go crazy, but definitely keep this in your back pocket.
