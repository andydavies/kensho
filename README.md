kensho
======

This is an attempt at extending Chrome to produce resource dependency trees for HTML pages

At Velocity EU, [Rajiv Vijayakumar](https://twitter.com/vrajivk) of Qualcomm demonstrated 
a tool they're  building to map the resource dependencies in webpages including blocking 
paths etc.

Currently it's not clear whether Qualcomm are going to opensource the tool, or run it as a
service (like WebPageTest), so this an initial attempt at producing something similar in 
Chrome (or WebKit) dev tools and Mike Bostock's [D3.js](http://d3js.org/)

##Current State

You can currently produce images like this but there's a few issues (read on below):

![www.telegraph.co.uk](https://pbs.twimg.com/media/A5KE4BxCMAIRhR4.png:large)

##Issues
There's a few issues that need to be cracked before the diagrams produced are accurate.
The main issue is that the initiator object doesn't contain enough information to resolve 
some relationships correctly.

For example CSS background images have an initiator of the line in the HTML that 
references the relevant CSS as that's what triggered the browser to load the image.

```
#logo { background: url('/content/images/web/logo.png')' }
```
```
<a href="/" title="Logo" id="logo">Logo</a>
```

Between [Marco Tolk](https://twitter.com/marco_tolk) and [myself](https://twitter.com/andydavies)
we're trying to put together a series of tests to determine which initiators are correct
for our purposes and which need work.

##Getting Started

It's all still a bit hacky at the moment but my main focus is getting the tree data correct.

First set up a debugging version of dev tools [Contributing to Chrome Developer Tools](https://developers.google.com/chrome-developer-tools/docs/contributing)

This repository only contains files that are new or difference to take the files that are 
in inspector/front-end and add them to WebKit/Source/WebCore/inspector/front-end

When you then use the local copy of dev tools you'll see a Create Dependency Tree option
in the Network tab context menu. Choosing this will then dump a tree in JSON format into
a new browser window.

Cut and past this code into the appropriate point in viewer/template.html and then load
the page into a browser.

##Future Ideas

There's plenty of ideas as to how the diagrams might be improved, for example:

- Size nodes based on download size, showing GZIP savings (if relevant)
- Makes the length of the links time related 
- Add radial axes for browser event such as start render, DOMContentReady etc.
- Build as a Chrome extension and use the debugging API to extract the required data

##Why Kensho?

Well techie people like picking 'poncy' names for stuff and according to Wikipedia 
[Kenshō is an initial insight or awakening](http://en.wikipedia.org/wiki/Kensh%C5%8D) so 
it sort of seemed apt.

