function round(v, n=100) {
  return Math.round(v*n)/n
}

function solve2(a, b, c, d, x, y) {
  const det = a * d - b * c
  return [(d * x - b * y) / det, (a * y - c * x) / det]
}

function polygon(pa, pb, pc, selectors) {
  const ab = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2, z: (pa.z + pb.z) / 2 + Math.random() }
  const bc = { x: (pb.x + pc.x) / 2, y: (pb.y + pc.y) / 2, z: (pb.z + pc.z) / 2 + Math.random()  }
  const ca = { x: (pc.x + pa.x) / 2, y: (pc.y + pa.y) / 2, z: (pc.z + pa.z) / 2 + Math.random()  }
  square(pa, ab, ca, selectors[0])
  square(pb, bc, ab, selectors[1])
  square(pc, ca, bc, selectors[2])



  // if ((pb.x - pa.x) * (pc.y - pa.y) - (pb.y - pa.y) * (pc.x - pa.x) < 0) {
  //   return polygon(pa, pc, pb, selector)
  // }
  // const xs = [pa.x, pb.x, pc.x]
  // const ys = [pa.y, pb.y, pc.y]
  // const left = Math.floor(Math.min(...xs))
  // const right = Math.ceil(Math.max(...xs))
  // const top = Math.floor(Math.min(...ys))
  // const bottom = Math.ceil(Math.max(...ys))


}
function square(pa, pb, pc, selector) {
  const size = 100
  xf = { x: (pb.x - pa.x) / size, y: (pb.y - pa.y) / size }
  yf = { x: (pc.x - pa.x) / size, y: (pc.y - pa.y) / size }

  const [ax, ay] = solve2(pb.x - pa.x, pb.y - pa.y, pc.x - pa.x, pc.y - pa.y, pb.z - pa.z, pc.z - pa.z)

  // matrix3d = [
  //   1,0,0,0,
  //   0,1,0,0,
  //   ax,ay,1,pa.z-ax*pa.x-ay*pa.y,
  //   0,0,0,1
  // ]
  // matrix2d = [
  //   xf.x, yf.x, 0, pa.x,
  //   xf.y, yf.y, 0, pa.y,
  //   0,    0,    1, 0,
  //   0,    0,    0, 1,
  // ]

  const matrix = [
    xf.x, xf.y, ax * xf.x + ay * xf.y, 0,
    yf.x, yf.y, ax * yf.x + ay * yf.y, 0,
    0, 0, 1, 0,
    pa.x, pa.y, ax * pa.x + ay * pa.y + pa.z - ax * pa.x - ay * pa.y, 1
  ]
  const styles = []
  styles.push(`${selector}{
    position:absolute;
    left:0;
    top:0;
    width:${size}px;
    height:${size}px;
    overflow:hidden;
    /*background-color:#${Math.floor(0x100+Math.random()*0xeff).toString(16)};*/
    transform-origin:0 0;
    transform:matrix3d(${matrix.map(v => round(v, 10000000000)).join(',')});
  }`)

  const patternEnabled = false
  if (patternEnabled) {
    // P = xf * x + yf * y + pa
    // P - pa = [xf,yf] * p
    // p = [xf,yf]**(-1) * (P - pa)
    const det = xf.x * yf.y - xf.y * yf.x
    //   |yf.y/det, -yf.x/det| * |-pa.x|
    //   |-xf.y/det, xf.x/det| * |-pa.y|
    const mat2 = [
      yf.y / det, -xf.y / det,
      -yf.x / det, xf.x / det,
      (-pa.x * yf.y + pa.y * yf.x) / det, (xf.y * pa.x - xf.x * pa.y) / det
    ]
    const pd = {
      x: pb.x + pc.x - pa.x,
      y: pb.y + pc.y - pa.y
    }
    styles.push(`${selector}>i{
      content:'';
      position:absolute;
      left:0;
      top:0;
      width:${Math.ceil(Math.max(pa.x, pb.x, pc.x, pd.x))}px;
      height:${Math.ceil(Math.max(pa.y, pb.y, pc.y, pd.y))}px;
      transform:matrix(${mat2.map(v => round(v, 10000000000)).join(',')});
      transform-origin:0 0;
    }`)
  }
  const style = document.createElement('style')
  style.textContent=styles.join('')
  document.head.appendChild(style)
}

// polygon(
//   { x: 100, y: 120, z: 100 },
//   { x: 400, y: 210, z: 100 },
//   { x: 150, y: 520, z: 100 },
//   ['#view>i:nth-child(1)','#view>i:nth-child(2)','#view>i:nth-child(3)']
// )
// polygon(
//   { x: 150, y: 520, z: 100 },
//   { x: 400, y: 210, z: 100 },
//   { x: 500, y: 400, z: 100 },
//   ['#view>i:nth-child(4)','#view>i:nth-child(5)','#view>i:nth-child(6)']
// )

// polygon(
//   { x: 200, y: 200, z: 200 },
//   { x: 400, y: 400, z: 100 },
//   { x: 400, y: 200, z: 0 },
//   ['#view>i:nth-child(7)','#view>i:nth-child(8)','#view>i:nth-child(9)']
// )


const outline = [
  { x: 650, y: 500, z: 0 },
  { x: 300, y: 500, z: 0 },
  { x: 0, y: 400, z: 0 },
  { x: 100, y: 200, z: 0 },
  { x: 320, y: 20, z: 0 },
  { x: 700, y: 0, z: 0 },
  { x: 800, y: 50, z: 0 },
  { x: 1000, y: 250, z: 0 },
  { x: 900, y: 450, z: 0 },
  { x: 665, y: 505, z: 0 }
]
const hratio = 3 / 5
const stairs = [
  [{ x: 650, y: 500 }, { x: 670, y: 440 }],
  [{ x: 690, y: 420 }, { x: 780, y: 390 }],
  [{ x: 780, y: 390 }, { x: 710, y: 180 }]
].map(ps => ps.map(({ x, y }) => ({ x, y, z: (500 - y) * hratio })))
const stairs2 = stairs.map(ps => ps.map(({ x, y }) => {
  const dx = ps[1].x - ps[0].x
  const dy = ps[1].y - ps[0].y
  const dr = Math.hypot(dx, dy) / Math.sqrt(250)
  let lx = -Math.round(dy / dr)
  let ly = +Math.round(dx / dr)
  return {
    x: x + lx,
    y: y + ly,
    z: (500 - y) * hratio
  }
}))

console.log(stairs)
console.log(stairs2)
let selectorCount = 0
function nextSelector() {
  return `#view>i:nth-child(${++selectorCount})`
}
function nextSelectors() {
  return [nextSelector(), nextSelector(), nextSelector()]
}
const center = { x: 250, y: 250, z: 250 * hratio }
const cs = [stairs[2][1], stairs[1][1], stairs[1][0], stairs[0][1], ...outline.slice(0, 5)]
for (let i = 0; i < cs.length - 1; i++) {
  polygon(cs[i], cs[i+1], center, nextSelectors())
}
const center2 = stairs[2][1]
const center3 = stairs2[2][1]
polygon(outline[4], center2, center, nextSelectors())
polygon(outline[4], outline[5], center2, nextSelectors())
polygon(outline[5], outline[6], center2, nextSelectors())
polygon(center3, outline[6], center2, nextSelectors())
polygon(center3, outline[6], outline[7], nextSelectors())
polygon(center3, outline[7], stairs2[2][0], nextSelectors())
polygon(outline[8], outline[7], stairs2[2][0], nextSelectors())
polygon(outline[8], stairs2[1][1], stairs2[2][0], nextSelectors())
polygon(outline[8], stairs2[1][1], stairs2[1][0], nextSelectors())
polygon(outline[8], stairs2[0][1], stairs2[1][0], nextSelectors())

polygon(outline[8], outline[9], stairs2[0][1], nextSelectors())

polygon(stairs[0][0], stairs[0][1], stairs2[0][0], nextSelectors())
polygon(stairs2[0][1], stairs[0][1], stairs2[0][0], nextSelectors())

polygon(stairs[0][1], stairs2[0][1], stairs[1][0], nextSelectors())
polygon(stairs[1][0], stairs2[0][1], stairs2[1][0], nextSelectors())

polygon(stairs[1][0], stairs[1][1], stairs2[1][0], nextSelectors())
polygon(stairs2[1][1], stairs[1][1], stairs2[1][0], nextSelectors())
polygon(stairs2[1][1], stairs[1][1], stairs2[2][0], nextSelectors())
polygon(stairs[2][0], stairs[2][1], stairs2[2][0], nextSelectors())
polygon(stairs2[2][1], stairs[2][1], stairs2[2][0], nextSelectors())


