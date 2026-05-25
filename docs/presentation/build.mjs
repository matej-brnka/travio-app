import { readdirSync, readFileSync, writeFileSync } from 'fs'

const template = readFileSync('index.html', 'utf8')

const slides = readdirSync('slides')
  .filter(f => f.endsWith('.html'))
  .sort()
  .map(f => readFileSync(`slides/${f}`, 'utf8'))
  .join('\n')

// vloží slidy do šablony
const withSlides = template.replace(
  '<div class="slides" id="slides"></div>',
  `<div class="slides">\n${slides}\n</div>`
)

// odstraní fetch skript – v buildu už není potřeba
const output = withSlides.replace(
  /<script type="module">[\s\S]*?<\/script>/,
  `<script>
    Reveal.initialize({
      hash: true,
      slideNumber: 'c/t',
      transition: 'slide',
      center: false,
      width: 1280,
      height: 720,
      margin: 0.05,
      minScale: 0.2,
      maxScale: 2.0,
      plugins: [RevealHighlight, RevealNotes],
    })
  </script>`
)

writeFileSync('prezentace.html', output)
console.log('✓ prezentace.html sestavena')