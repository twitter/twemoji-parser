# Twemoji Parser

A simple library for identifying emoji entities within a string in order to render them as Twemoji.

For example, this parser is used within the rendering flow for Tweets and other text on [mobile.twitter.com](https://mobile.twitter.com)

## Usage
The [tests](src/__tests__/index.test.js) are intended to serve as a more exhaustive source of documentation, but the general idea is that the parser takes a string and returns an array of the emoji entities it finds:
```js
import { parse } from 'twemoji-parser';
parse('I 🧡 Twemoji! 🥳');
/*
[
  {
    url: 'https://twemoji.maxcdn.com/2/svg/1f9e1.svg',
    indices: [ 2, 4 ],
    text: '🧡',
    type: 'emoji'
  },
  {
    url: 'https://twemoji.maxcdn.com/2/svg/1f973.svg',
    indices: [ 12, 14 ],
    text: '🥳',
    type: 'emoji'
  }
]
*/
```
