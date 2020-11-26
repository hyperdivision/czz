# `CZZ`

> ZZZ CSS

## Usage

```js
var CZZ = require('CZZ')

var className = CZZ`
/* CZZ is a CSS-in-JS dialect inspired by BSS */
// Extensions include single line comments

width: 100px; // And you can define styles right here and they will be wrapped

/* You can also use shorthands. Emmet-style shorthands are built-in, and if
 * naked units are found, and pixel support can be detected, they will be
 * transformed. Eg the next line becomes 'height: 100px'
 */
h 100

// Substyles are automagically nested, ie this becomes '.RANDOM_CLASS .child'
.child {
  // The & operator can be used to insert the parent selector, here yielding
  // .RANDOM_CLASS .child.compound-child
  &.compound-child {

  }
}

// naked pseudo classes are also handled, ie '.RANDOM_CLASS .foo:hover'
:hover {
  c red
}

// You can also define inline animations. Here we animate the opacity
animation 1200ms {
  from { o 0 }
  to { o 1 }
}

// Media queries can also be nested at any spot
@media only screen and (max-width: 600px) {
  w 100%
}
```

Will generate something similar to:

```css
@keyframes czz-ani-sm8y00rd71 {
  from {
    opacity: 0;
  }

  to {
    opacity: 0;
  }
}

.czz-np4ddc2dsth {
  width: 100px;
  height: 100px;
  animation: 1200mx czz-ani-sm8y00rd71;
}

.czz-np4ddc2dsth .child.compound-child {}

.czz-np4ddc2dsth:hover {
  color: red;
}

@media only screen and (max-width: 600px) {
  .czz-np4ddc2dsth {
    width: 100%;
  }
}
```

## API

### ``const styles = CZZ`...css...` ``
CZZ composable styles. Suppots:

* Random, namespaced class name for top-level CSS rules, eg. `width: 100px;` -> `.parent { width: 100px; }`
* Nesting with naked selectors or `&`
  - Classes are nested with space between, eg. `.child` -> `.parent .child`
  - Pseudo classes are nested directly, eg. `:hover` -> `.parent:hover`
  - Multiple selectors are split, eg. `.child, :hover` -> `.parent .child, .parent:hover`
  - `&` marks parent selector placement, eg. `.foo &` -> `.foo .parent`
* Shorthands through transforms, eg. `w 100` -> `width: 100px`
* Automatic unit insertion, eg. `w 100` -> `width: 100px` (notice `px`)
* Multiline (`/* ... */`) and single-line (`// ...`) comments
* Inline animations, eg. `animation 125ms ease { ...keyframes... }`
* Inline media queries, which understand nesting
* Composition using compound CSS selectors.

Rules are automatically injected into a `<head>` style tag the first time
they're seen. Rules are cached based on string equality to avoid leaking memory
when rerendering styles.

See below API for the function returned.


#### ``const composed = styles`...css...` ``
Compose with new rules, meaning you can "inherit" namespaced rules.

#### `const selector = styles.toString()`
Returns the generated selector

#### `const classList = styles.classList`
Array of class names that are composed together. Can be added with
`elm.classList.add(...styles.classList)`

#### `const css = styles.css`
String containing the generated CSS

### ``const styles = CZZ.global`...css...` ``
Create a global style. Naked classes here are not automatically nested, hence
you can create rules for top-level classes and elements. Stray rules are nested
under a `.czz-global-*` class, which is contained in the `styles` function.
Otherwise follows the rules of plain `CZZ`

### `CZZ.transforms`

A global array of transformation functions. When parsing unknown properties of
`CZZ`, each transformation is tried in succession until either a set of rules
are returned or the list is exhausted. You can `.push` or `.unshift` the array
as you want, just be aware that this must be done before any styles are applied
and that the array is global.

By default the list contains Emmet style CSS shorthands.

See below for details on how to make *Custom transforms*.

### Automatic unit insertion

`px` will be applied as the default unit where possible. However units will not
be applied to numbers between `(` `)`, unless it is `translate(…)` or
`rotate(…)` (in the ladder case the unit will be `deg`). This is to avoid
`rgb(100, 100, 100)` from becoming `rgb(100px, 100px, 100px)`.

Pixel support is detected by taking the CSS property name and applying a `1px`
rule, and if this can be read back out, it will be flagged as supporting pixels.
Hardcoded exceptions exist in `lib/is-pixel.js`

### Custom transforms

Custom transforms can be passed as functions taking arguments `property` and
`value`. Any non-falsy return will be applied as the transform and no other
transforms will be attempted. To apply a transform you must return an array of
resolved rules. The values will have the above "Automatic unit insertion"
applied.

```js
// Tailwind style 'truncate', example `truncate ellipsis`
module.exports = (property, value) => property === 'truncate' && [
  ['overflow', 'hidden'],
  ['text-overflow', value],
  ['white-space', 'nowrap']
]

// Tailwind style 'px' (padding along the x axis), example `px 1rem`
module.exports = (property, value) => property === 'px' && [
  ['padding-left', value],
  ['padding-right', value]
]
```

## Install

```sh
npm install czz
```

## Credits

CZZ is strongly inspired by [`BSS`](https://github.com/porsager/bss) but with
small modifications, and is more strict in it's parsing.

## License

[ISC](LICENSE)
