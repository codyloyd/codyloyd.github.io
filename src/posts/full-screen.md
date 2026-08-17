---
layout: post.njk
title: "Full-Screen App-Like Layouts"
date: 2021-02-22
tags: ["post", "CSS", "responsive"]
permalink: /2021/full-screen/
---

Web apps that behave like full-screen native apps have become commonplace.  I've come across many designs for web-based projects that have a layout with a static header, a static footer, and some scrolling dynamic content in between. In the past, this kind of full-screen layout was difficult to pull off, but CSS has evolved to the point where that is no longer the case.

## Viewport Units

First: a warning.  Viewport units (`vh/vw`) are one of the more interesting newer developments in CSS. Check [here](https://css-tricks.com/fun-viewport-units/) if you're unfamiliar.  Viewport units seem like the perfect tool for creating a full-height layout, but they come with a pretty big pitfall: they can be buggy on smartphones. This is likely to improve a bit as phone technology improves, but the way that phone browsers (specifically iOS browsers) interpret the 'viewport' is not the way most people expect or desire.

The most significant issue is the toolbar at the bottom.

It appears and disappears as you scroll around and tap on the webpage/browser, and on iOS is *not* taken into account when viewport units are calculated.

![Safari toolbar visible](/images/safari-1.png)

![Safari toolbar hidden](/images/safari.png)

Consider the following:

```html
<div class="full-screen">
  <div class="header"></div>
  <div class="content">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi, voluptatibus odio? Obcaecati neque nesciunt officiis nulla iusto veritatis, quas mollitia provident, ullam optio possimus ducimus perspiciatis magnam ab et excepturi.
  </div>
  <div class="footer"></div>
</div>
```

```css
* {box-sizing: border-box;}
body {margin: 0;}

.full-screen {
  background: pink;
  font-size: 32px;
  height: 100vh;
}

.content {
  padding: 16px;
  // header and footer are 50px each
  height: calc(100% - 100px);
}

.header {
  height: 50px;
  background: blue;
}

.footer {
  height: 50px;
  background: green;
}
```

![Basic full-screen layout](/images/footer.png)

In this example, which looks and works fine on most desktop browsers, (and android browsers too) the footer would likely spend a lot of time covered up by the iOS safari toolbar, which is no good if you are intending to put important information or buttons down there.

### Solutions

Unfortunately the solution here is less elegant looking than the 100vh, but it does have the advantage of *working as intended*. The solution is to use `position: fixed`. The screenshot from my browser would look the same here, so I'll just paste in the code that's been changed. We're not done with this example yet either, so I'll wait to post the whole code until we're done.

```css
.full-screen {
  background: pink;
  font-size: 32px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
```

`position: fixed` with `top`, `left`, `right`, and `bottom` set to `0` is not *technically* the same effect as `height: 100vh`, but if the desire is to create a full-screen app-like experience then it's closer to what you *actually* want.

## Sticking the Footer to the Bottom

OK listen. Calc is awesome, and I'm not about to tell you to never use it…. but the example I've just shown you has another problem here:

```css
.content {
  padding: 16px;
  // header and footer are 50px each
  height: calc(100% - 100px);
}
```

This section is the middle of our full-screen view. The part with all the text. We set the height like this to push the footer to the bottom of the screen. Without it, our app would look like this:

![Viewport height with calc](/images/viewportheight.png)

However, doing this calculation requires that our header and footer *always* add up to exactly 100px, which is kind of hard to guarantee. If we're creating a multi-use layout component that lets us stick in different header/footer combinations or if we are always using the same header but sticking in different content (titles, subtitles, buttons, whatever), it can be hard to guarantee that nothing is ever going to overflow and expand the header. Sometimes the design changes!

One solution to avoid is using `position: fixed` or `position: absolute` to force the footer to the bottom.  Doing so *will* stick the footer where you want it, but it will introduce a new problem: the footer now covers up the bottom of our content section.  This can be combated with some extra padding on the bottom of `.content`, but then we again run into the problem of having to hard-code that height.

A better solution here is to use flexbox (with `flex-direction: column`) to make sure our design is…. *flexible*.  Combined with `overflow: auto` on `.content` we now have exactly what we want, and it behaves correctly on all devices.

![Flexible layout with flexbox](/images/flexible.gif)

Check out the full code for this finished layout [here on CodePen](https://codepen.io/codyloyd/pen/qBqXbLN?editors=1100).

### What about Grid!?

You can accomplish the same layout with less code using Grid.  There are a few reasons why you might want to stick with the flex version, but grid is here to stay.  The technique is similar, but in addition to the `position: fixed` you need to add a `height: 100%` to make this work on Safari (works on other browsers without it).

The secret sauce for getting a static header and footer is using `max-content`  to define your grid-rows.  Doing this avoids having to hard-code the height of our header and footer.

```css
.container {
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
```

[Check the full example in this codepen](https://codepen.io/codyloyd/pen/dyOVMGN?editors=0100).
