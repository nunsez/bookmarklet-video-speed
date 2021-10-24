# Bookmarklet Video Speed Controller

A script to control the speed of HTML5 video playback in the browser.

## Installation

The installation is simple.
It is a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet).
Manually create a bookmark with this code in URL field:

```js
javascript:(()=>{const e=document.createElement('script');e.setAttribute('src','https://nunsez.github.io/bookmarklet-video-speed/src/bookmarklet-video-speed.min.js');document.body.append(e)})()
```

## Usage

Once it is on your bookmarks, you can click on this bookmarklet.\
A small box shows up in the upper left corner. You can use range controller or buttons ("**+**" and "**-**") to increase or diminish the speed of the video.\
Click it again and the small speed box will disappear and the video will go back to normal speed.

**Important note!**\
When you activate this bookmarklet, all HTML5 videos on your page are affected by the controller.
