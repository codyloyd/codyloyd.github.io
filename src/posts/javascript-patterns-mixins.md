---
layout: post.njk
title: "JavaScript Patterns: Mixins"
date: 2021-03-26
tags: ["post", "Design Patterns", "JavaScript"]
permalink: /2021/javascript-patterns-mixins/
---

Mixins are not one of the patterns specified in the original Gang-of-Four Design Patterns book, but you can use them to facilitate some of those patterns.  A mixin is simply a way to add functionality to a class without worrying about inheritance chains.  Ideally, you can use them whenever you need to share behavior between different classes, but when making those classes inherit from the same base class doesn't make sense.

Mixins can take many forms.  Especially in JavaScript, there are many ways to add methods to any given object, so don't think that this is the only way or even the *right* way to do it… it's just my favorite.

In the pattern I'm presenting here, a mixin is simply a function that takes a class and returns a new class with the new functionality added in.  Doing this is very simple:

```js
function ThisIsAMixin(Superclass) {
  class Mixin extends Superclass {
    logHello() {
      console.log(this.hello)
    }
  }

  return Mixin
}
```

The mixin function takes any class as a parameter, creates a new class that extends it, and then returns it.  Any function that you put in the mixin will now be available inside the class that gets returned. Usage is also straightforward:

```js
class ThisNeedsMixins {
  constructor () {
    this.hello = "Hello, World!"
  }
}

const myObject = new ThisIsAMixin(ThisNeedsMixins)
myObject.logHello() // "Hello, World!"
```

In the above example, the `logHello` function is not in the original class but can reference a variable inside that class.  Using mixins like this is essentially the same as just copying that function into the class itself.  The benefit here is that if you have some functions that you need in multiple classes, you can extract them out and not have so much repetition in your code.  Another benefit is that you gain the ability to mix and match these mixins as you need to… long chains of mixins work just fine:

```js
const myObject = Mixin(AnotherMixin(ThreeMixins(TheOriginalClass)))
```

For some kinds of functionality, this beats normal Inheritance by a mile.  If you were trying to set this up by doing 3 classes that all inherit from each other, then you would end up bundling *all* that functionality into every class, even when you might only need one or two of the functions in the huge class you have to inherit from.

### Some Warnings

Of course this pattern is not the only one you should use for sharing functions across your codebase.  In many cases (like the simple example I gave above!) it makes more sense to just have some utility functions in a module that you can import wherever you need them.  There's no reason to add the overhead of a mixin when you can just call a utility!

Be very careful about coupling your mixins to each other.  You don't want the order of your mixins to matter, and you don't want your mixins to rely on other mixins to be present for them to function correctly!  Tying mixins to each other will make your code even more brittle than it would be without using mixins at all!

Be careful about coupling your base class to the mixins.  There are some cases where you might want to call a mixin function from the class that is taking it in, but be careful about over-relying on this behavior.  Coupling is dangerous!

In the end, mixins can be a powerful and flexible tool.  They aren't the only tool you should ever use, but when appropriate they're great!  I will likely use and refer to mixins as I progress through the rest of the Gang-of-Four Design patterns!
