---
layout: post.njk
title: "Design Patterns: Interpreter"
date: 2021-03-18
tags: ["post", "Design Patterns", "JavaScript"]
permalink: /2021/design-patterns-interpreter/
---

This series of posts covers the patterns presented in the classic book "[Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)." Here I break down the patterns and show examples in modern JavaScript.

The Interpreter pattern took me a while to actually understand.  When I first started digging into the pattern I had an incorrect assumption about what this pattern was actually trying to do.  The intent of this pattern, as stated in the book, is:

> Given a language, define a representation for it's grammar along with an interpreter that uses the representation to interpret sentences in the language

The examples they give include a representation of regular expressions, something like: `word & ( other | words)` or a system for evaluating boolean expressions like `(true and x) or (y and (not x))`. The big concept that I was missing here was that this pattern does *not* concern itself with parsing those expressions and turning them into code.  Rather, this pattern is about expressing those sentences in the code that you write yourself.

In this post, we're going to look at the boolean example.  I'll explain it as we go, but I'm starting with the end result in an attempt to avoid all confusion. We can represent the boolean expression listed above in code like so:

```js
// (true and x) or (y and (not x))
const expression = new OrExp(
  new AndExp(new Constant(true), x),
  new AndExp(y, new NotExp(x))
)

// the following assignments to x and y are pseudocode,
// we'll get to the real code soon!
context.x = true
context.y = false
const result = expression.evaluate(context)

// with these values of x and y, the result is TRUE!
// (true and x) or (y and (not x))
// (true and true) or (false and (not false))
// (true) or (false and true)
// true or false
// true
```

We'll get to exactly how these `OrExp` and `AndExp` classes function, but take a minute to make sure you see how that code relates to the boolean "sentence."  TO be clear, we are *not* writing the code that turns our sentence into this expression.. we're writing the code that makes this expression work.

This one is a little complicated so buckle up.

## Structure

The basic building block of an interpreter is an abstract base class for the Expression.  We're creating a boolean evaluator, so in this example code, it's called `BooleanExp`.  Though we could extend it, it only needs a single function,  `evaluate` (sometimes, more officially called `interpret`)

```js
class BooleanExp {
  constructor() {}

  // returns a bool
  evaluate(context) {}
}
```

The evaluate function takes in a parameter called 'context,' which is another object.  The context object holds information about the expression that we're evaluating.  In this example, all we need to hold are the values of the variables that we're passing into the expression, x, and y.  In more complicated examples, it might contain more details about the input/output of the expression.  The context object looks like this:

```js
class Context {
  constructor() {
    this.chars = {}
  }
  // returns bool
  lookup(varName) {
    return this.chars[varName]
  }

  assign(variableExp, bool) {
    this.chars[variableExp.getName()] = bool
  }
}
```

In this class, `this.chars` is an object that holds all the variables we need for our evaluation.  The lookup function simply finds the value of a given variable, and the assign function sets that value.  You'll see that one of the parameters of the assign function is a `variableExp`, that is a subclass of our base `BooleanExp`, which we will discuss shortly.

## Terminal Expressions

Probably the most important concept in this pattern is its recursive tree-like structure. When the evaluate function is run, subclasses of BooleanExp will call evaluate() on their children.  Those children are, of course, also subclasses of BooleanExp, so they too will call evaluate() on their children, which may or may also be more subclasses of BooleanExp.  The only way out of this recursive loop is to have some of our expressions that return a value (true or false in this case) without continuing the run down the tree.

An expression that returns a value, ending that branch of the tree, is a terminal expression.  Expressions that continue branching and calling the evaluate function are called nonterminal expressions.  In our example, we have two terminal expressions, `Constant` and `VariableExp`.

```js
class Constant extends BooleanExp {
  constructor(value) {
    super()
    this._value = value
  }

  evaluate(context) {
    return this._value
  }
}

// example usage
const myTrueConstant = new Constant(true)
const result = myTrueConstant.evaluate(context) // result is `true`
```

Constant is simply a representation of the values `true` or `false`.  All they have to do is return that value when they are evaluated.  Notice that the Constant's evaluate function does not use the context that is passed into it.  This is fine, not every expression will need it, but since we don't know how an expression will end up being evaluated we need to pass it in to *every* evaluate function.

```js
class VariableExp extends BooleanExp {
  constructor(name) {
    super()
    this._name = name
  }

  evaluate(context) {
    return context.lookup(this._name)
  }

  getName() {
    return this._name
  }
}
```

The only expression that *does* use the context is our other terminal expression, VariableExp.  The variable expression simply represents one of our variables.  The actual value of these variables are stored in the Context object, so when the variable is evaluated it uses the context to find it's value.

The example that I started this article with had a bit of pseudocode related to assigning those variables. Now that we have defined the Context object and variable expressions we can reveal the real code.

```js
const context = new Context()

const x = new VariableExp("X")
const y = new VariableExp("Y")

// (true and x) or (y and (not x))
const expression = new OrExp(
  new AndExp(new Constant(true), x),
  new AndExp(y, new NotExp(x))
)

context.assign(x, true)
context.assign(y, false)

const result = expression.evaluate(context)
```

## Nonterminal Expressions

As i mentioned earlier, when nonterminal expressions are evaluated, they evaluate their children.  In our Boolean example we have three nonterminal expressions: and, or, and not.

These expressions all work almost identically so we really only need to dig into one of them, the `AndExp`

```js
class AndExp extends BooleanExp {
  constructor(booleanExp1, booleanExp2) {
    super()
    this._operand1 = booleanExp1
    this._operand2 = booleanExp2
  }

  evaluate(context) {
    return this._operand1.evaluate(context) && this._operand2.evaluate(context)
  }
}
```

As you can see, it takes in two parameters, both of them other Boolean-Expressions that we're calling operands.  When an And-Expression is evaluated it evaluates both of those operands and returns the value of  `operand1 && operand2`.

If either of those operands are terminal expressions (i.e. constants or variables), then the evaluate function will return those values, but if they are nonterminal expressions then the tree continues to grow until a terminal value is reached.  The following is a simple example using only AndExpressions and Constants.

```js
const context = new Context()

const expression1 = new AndExp(
  new Constant(true),
  new Constant(true)
)
const result1 = expression1.evaluate(context) // true && true === true

const expression2 = new AndExp(
  new Constant(true),
  new AndExp(
    new Constant(true),
    new Constant(false)
  )
)
const result2 = expression2.evaluate(context)
// true && (true && false) === true && false === false
```

Expression2 is the interesting one here because it shows how these expressions can be nested inside each other.  Since any nonterminal expression is just calling evaluate on it's children, those children can be more nonterminal expressions.  There is no limit to how deeply nested these things can get, so long as eventually the branches of the tree end up with a terminal expression.

With this knowledge, the full example should make sense now.  The other nonterminal expressions work just like AndExp, and the code for them can be seen on this [github repo.](https://github.com/codyloyd/interpreter_pattern_example)

## Conclusions

Honestly, I feel like this is only half of a pattern in its current form.  It seems like it is minimally useful without some parser that actually takes the string and turns it into this code… but then again, parsers are a completely different rabbit hole.  Combined with a parser, I do feel like this could be a useful pattern to know for creating little mini-languages in your codebase if that makes sense.  Imagine being able to parse the following silly markup into actual HTML!

```js
//div
//  heading -> "Hello World"
//  article
//    columns
//      paragraph -> "Text"
//      sidebar
//        list
//          ....you get the point

const myFrontendComponent = new DivComponent(
  new HeadingComponent("Hello World"),
  new ArticleComponent(
    new ColumnsComponent(
      new ParagraphComponent("Text"),
      new SidebarComponent(new ListComponent(....you get the point))
    )
)
)
```
