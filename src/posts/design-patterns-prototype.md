---
layout: post.njk
title: "Design Patterns: Prototype"
date: 2021-04-02
tags: ["post", "Design Patterns", "JavaScript"]
permalink: /2021/design-patterns-prototype/
---

This series of posts covers the patterns presented in the classic book "[Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)." Here I break down the patterns and show examples in modern JavaScript.

The Prototype Pattern is an interesting one for this discussion because it is basically built into the JavaScript language.  In fact, before Ecma International added the class keyword to the language in 2015, manipulating prototypes was the proper way to do Object-Oriented Programming.

Even so, there *is* a clear difference between the prototype keyword in the JavaScript language and the Prototype pattern described by the Gang.  You can use JavaScript prototypes to facilitate the pattern they describe, but there is more to what they're suggesting than simply throwing in the `prototype` keyword when defining objects.

The original pattern basically boils down to giving certain classes a `clone` function that allows you to make new objects with small changes without having to create a huge library of subclasses.  The example they give in the book is a good one.  Consider a music typesetting program where you have classes for each item you can place in your document, so you have classes for eighth notes, quarter notes, half notes etc.  These classes are extremely similar in behavior, differing only in the graphic that displays and their duration.  The standard non-pattern way of setting this up would be the following:

```js
class Note {}

class HalfNote extends Note {}

class QuarterNote extends Note {}

class EighthNote extends Note {}
```

However, doing it this way is going to get messy quickly!  There are multitudes of variations on a single 'note' that have the same behavior and only differ in small ways.  The solution given in the book then, is to give Note a 'clone' function.  The clone function allows you to get new instances of an object *without specifically instantiating it*.  In languages like C++ (the original target of the Design Patterns book) this is a very big deal.  The implications are that you can create many variants of a single class without subclassing, something like the following:

```js
const BaseNote = new Note()

const HalfNote = BaseNote.clone(duration, graphic)
const QuarterNote = BaseNote.clone(duration, graphic)
const EighthNote = BaseNote.clone(duration, graphic)
```

These clones are actual objects and NOT new classes, but they "inherit" the clone function from the BaseNote, so creating concrete instances of them is as easy as calling that clone function again.

```js
function insertQuarterNote() {
  const newNote = QuarterNote.clone()
  // insert note into document here.
}
```

An amazing benefit here is that you don't even have to specifically define clones for each note variant.  This could be done on the fly by the client!  There are many ways you could achieve this, but one easy way would be an object that maps durations and graphics to specific notes.

```js
const notes = {
  quarter: { duration: 4, graphic: "quarter.png"},
  eighth: { duration: 2, graphic: "eighth.png"},
  half: { duration: 8, graphic: "half.png"},
}

function insertNote(noteType) {
  const newNote = Note.clone(notes[noteType])
}
```

## But JavaScript is Cooler than C++

Ok, salacious headline aside, JavaScript makes this pattern *exceptionally* easy to implement.  For one: technically, because of how inheritance works in JS, you're using prototypes every time you use a class in the first place.  In JavaScript, everything is an object, even classes, so instantiating objects from classes is technically just cloning an object.  Obviously, that isn't the point of this pattern, but it does mean that some of the specific uses of this pattern, as listed in the book, are not relevant in JavaScript.

What I really mean when I say that JavaScript makes this pattern simple is that the methods for cloning and creating new objects are built right into the language itself, which means that unless you have some special behavior in mind, you do not need to implement and maintain the clone function in your objects,  you can clone them directly.  The magic function is `Object.create()`

```js
const BaseNote = new Note()

const quarterNote = Object.create(BaseNote)
quarterNote.duration = 4
quarterNote.graphic = "quarter.png"

// alternatively,  you can do it in one function call, though the syntax is a little messy:
const quarterNote = Object.create(BaseNote, {
  duration: {value: 4},
  graphic: {value: "quarter"}
})
```

The above pattern combined with the "map object" from my above example can make this an extremely flexible pattern for creating small variations between many similar objects.  Here's a complete working example that gets even more condensed with the Object creation.  In this example, I'm just printing the duration and graphic to the console instead of actually inserting anything into a document.

```js
const notes = {
  quarter: { duration: 4, graphic: "quarter.png"},
  eighth: { duration: 2, graphic: "eighth.png"},
  half: { duration: 8, graphic: "half.png"},
}

class Note {
  constructor() {
    this.duration = null
    this.graphic = null
  }

  print() {
    console.log(this.duration, "-", this.graphic)
  }
}

function insertNote(noteType) {
  // Object.assign() assigns the values from one object into another,
  // Here we create a new base-note and then "assign" the values
  // that we defined in the "notes" object
  const note = Object.assign(new Note(), notes[noteType])

  note.print()
}

insertNote("quarter") // prints "4 - quarter.png"
insertNote("eighth") // prints "2 - eighth.png"
insertNote("half") // prints "8 - half.png"
```

Honestly, this pattern is very handy.  Many of the other patterns described in this book could benefit from using the prototype pattern to streamline small differences instead of creating huge libraries of subclasses.  Additionally, if the application calls for it, new variations can be created on the fly by the client or even the end-user.  You could even create variations on objects from data stored on a database (though I'd be careful about that one!)

In the end, this pattern is not new or groundbreaking for JavaScript enthusiasts.  It really is just how the language itself handles Object-Oriented Programming.  Perhaps this conclusion is a little underwhelming, but I think it's good to have a reminder that we don't always need to create gargantuan spiderwebs of subclasses.  Personally, now that I've spent some time researching these fundamental design patterns, I tend to forget just how simple JavaScript makes some of these things… so much so that it might not even be worth talking about.
