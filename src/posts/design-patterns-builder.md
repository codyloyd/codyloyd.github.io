---
layout: post.njk
title: "Design Patterns: Builder"
date: 2021-03-05
tags: ["post", "Design Patterns", "JavaScript"]
permalink: /2021/design-patterns-builder/
---

This series of posts covers the patterns presented in the classic book "[Design Patterns: Elements of Reusable Object-Oriented Software](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)." Here I break down the patterns and show examples in modern JavaScript.

The builder pattern is very similar to the factory patterns that I discussed [in a previous post](/2021/factories/).  In the factory patterns, you either create a class or a method to create instances of your objects for you.  A builder is also a class that creates objects for you, but the way it goes about it is subtly different.

The biggest difference between factories and builders is that factories always instantly return the object you request. In contrast, the builder maintains a reference to that object and can supply it to the client upon request.  The implication is that you can further hide your implementation details inside a builder to build radically different types of objects using the same interface.

You can see the difference between a factory and a builder with a simple example. The following code includes two functions that essentially do the same thing.  These functions take some parameters and then use them to create some complex object.  In the factory example, each function returns the piece built in each step, and these pieces then need to be composed into the final product.  In contrast, the builder example stores both the intermediate objects and the final product internally, only returning it when requested using the `getProduct()` function.

```js
// factory
functionThatUsesFactories(param1, param2) {
  const aThing = factory.createAThing(param1)
  const anotherThing = factory.createAnotherThing(param2)
  const finalProduct = factory.createFinalProduct(aThing, anotherThing)

  return finalProduct
}

// builder
functionThatUsesABuilder(param1, param2) {
  builder.buildAThing(param2)
  builder.buildAnotherThing(param2)
  builder.buildFinalProduct()

  return builder.getProduct()
}
```

Obviously, this example is a little contrived; we probably don't need the intermediate steps in something as simple as this, so let's look at some real examples.

The Builder example given in the Gang of Four book is a reader of RTF documents.  This reader application can use subclasses of a Builder to transform RTF into any other format such as plain ASCII, LaTeX, or a graphical editor widget.  These builders would have the same interface (in this case, that might be functions such as `convertLine()` and `convertCharacter()`), but what they do behind the scenes can vary wildly.

## Code Example

All of this code can be found [on GitHub](https://github.com/codyloyd/CreationalPatternExamples).

I have implemented another example given in the book, a straightforward Maze game.  There's no UI to *play* the game, but there are functions that allow the player to move between the various rooms and interact with walls and doors inside the maze.  The full code can be run and will print out the results to the browser's console.

```js
console.log('--------------default game--------------');
const game = new MazeGame();
const maze = game.createMaze();

game.getCurrentRoom(); // You are in room number 1
game.tryDirection('north'); //  --- trying to go north -- You bump into a wall
game.tryDirection('east'); // --- trying to go east -- ouch, you bumped your nose on the door
game.tryDirection('south', 'open'); // --- trying to open south -- you can't open that
game.tryDirection('east', 'open'); // --- trying to open east -- you open the door
game.tryDirection('east'); // --- trying to go east -- You are in room number 2
game.tryDirection('west'); // --- trying to go west -- You are in room number 1
```

## Creational base

Most of the setup for the actual builder examples occurs inside `creational_base.js`. Classes are created for the `Maze` and `MazeGame` itself and the various elements you can encounter in the maze, `Room`s, `Wall`s, and `Door`s.

The interesting bit here, and the part that actually changes in the builder is MazeGame.createMaze(). In this example, it's fairly naive. It simply grabs and instantiates the room, wall and door classes that we created and builds a simple 2-room maze:

```js
createMaze() {
  const aMaze = new Maze();
  const r1 = new Room(1);
  const r2 = new Room(2);
  const door = new Door(r1, r2);

  aMaze.addRoom(r1);
  aMaze.addRoom(r2);

  r1.setSide('north', new Wall());
  r1.setSide('east', door);
  r1.setSide('south', new Wall());
  r1.setSide('west', new Wall());

  r2.setSide('north', new Wall());
  r2.setSide('east', new Wall());
  r2.setSide('south', new Wall());
  r2.setSide('west', door);

  this.currentRoom = r1;

  return aMaze;
}
```

This is obviously quite inflexible because it hard-codes the classes right in the code. Adding new types of rooms, walls, or doors will get messy quickly… so, just like we did with the factory examples, we'll outsource the creation of a maze to a Builder class.

## Builder example

One feature of a builder is that it always uses an abstract base class with empty functions.

```js
class MazeBuilder {
  constructor() {}
  buildMaze() {}
  buildRoom() {}
  buildDoor() {}

  getMaze() {}
}
```

Doing this allows the subclasses the flexibility to redefine only the methods they actually need to do the building.  We could, for example,  have an empty abstract function called `buildTrap` that inserts traps into our maze, but since not every kind of maze would need traps a builder subclass could simply not define that function.

Our subclass, the one that actually gets used by our maze game, creates and stores a reference to the maze and then appends rooms to that maze and creates doors between the rooms.

```js
class StandardMazeBuilder extends MazeBuilder {
  constructor() {
    super()
    this._currentMaze = null
  }

  buildMaze() {
    this._currentMaze = new Maze()
  }

  buildRoom(id) {
    if (!this._currentMaze.getRoom(id)) {
      const room = new Room(id)

      room.setSide('north', new Wall())
      room.setSide('east', new Wall())
      room.setSide('south', new Wall())
      room.setSide('west', new Wall())

      this._currentMaze.addRoom(room)
    }
  }

  buildDoor(id1, dir1, id2, dir2) {
    const r1 = this._currentMaze.getRoom(id1)
    const r2 = this._currentMaze.getRoom(id2)

    const door = new Door(r1, r2)
    r1.setSide(dir1, door)
    r2.setSide(dir2, door)
  }

  getMaze() {
    return this._currentMaze
  }
}
```

The benefit to using this pattern can be seen in the `createMaze()` function.  Contrast the following to the original version found in `creational_base.js`.

```js
class BuilderMazeGame extends MazeGame {
  createMaze(builder) {
    builder.buildMaze()
    builder.buildRoom(1)
    builder.buildRoom(2)
    builder.buildDoor(1, 'east', 2, 'west')

    const maze = builder.getMaze()
    this.currentRoom = maze.getRoom(1)

    return maze
  }
```

We don't have to maintain references to the individual rooms and manually stick them in the maze and we don't have to manually create each wall in the rooms because these details are handled for us by the builder.  The builder keeps a reference to the maze object, so we can connect rooms with a door by using room ids and directions.

This API could easily be extended to create procedurally generated mazes of any size, and of course, it would be easy to add variants of each kind of item found in the maze.

One exciting benefit of using this pattern is that you can create objects with *wildly* different behaviors.  Our rooms and walls are currently just objects stored inside a maze object, but there is no reason that `getMaze` couldn't return some nodes to append to the DOM.  With a factory, you'd have to do that in a separate step and feed the maze object inside a `createDOMNodes` function.  Here, we could subclass our Builder and add it in.  Want to try something more exotic? Create another Builder subclass that builds a 3d maze with https://threejs.org/… our maze creation program becomes a LOT more flexible when outsourcing the actual object creation to a builder object.
