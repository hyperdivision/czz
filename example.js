const CZZ = require('.')

const styles = CZZ`
/* CZZ is a CSS-in-JS dialect inspired by BSS */
// Extensions include single line comments

width: 100px; // And you can define styles right here and they will be wrapped

/* You can also use shorthands. Emmet-style shorthands are built-in, and if
 * naked units are found, and pixel support can be detected, they will be
 * transformed. Eg the next line becomes 'height: 100px'
 */
h 100

d: "M 10,30
    A 20,20 0,0,1 50,30
    A 20,20 0,0,1 90,30
    Q 90,60 50,90
    Q 10,60 10,30 z";

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

bd 1px solid #999999
`

const s2 = styles`td underline`

const elm = document.createElement('h1')
elm.onclick = () => {
  console.log(CZZ.global`h1 { c red }`.css)
}

elm.textContent = 'Hello world'
elm.classList.add(...s2.classList)

console.log(styles.css)
console.log(s2.css)

document.body.append(elm)
