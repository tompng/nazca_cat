function round(v, n=100) {
  return Math.round(v*n)/n
}

function solve2(a, b, c, d, x, y) {
  const det = a * d - b * c
  return [(d * x - b * y) / det, (a * y - c * x) / det]
}

function polygon(pa, pb, pc, selector) {
  if ((pb.x - pa.x) * (pc.y - pa.y) - (pb.y - pa.y) * (pc.x - pa.x) < 0) {
    return polygon(pa, pc, pb, selector)
  }
  const xs = [pa.x, pb.x, pc.x]
  const ys = [pa.y, pb.y, pc.y]
  const left = Math.floor(Math.min(...xs)) - 1
  const right = Math.ceil(Math.max(...xs)) + 1
  const top = Math.floor(Math.min(...ys)) - 1
  const bottom = Math.ceil(Math.max(...ys)) + 1

  const argz = solve2(pb.x - pa.x, pb.y - pa.y, pc.x - pa.x, pc.y - pa.y, pb.z - pa.z, pc.z - pa.z)
  const matrix = [
    1, 0, argz[0], 0,
    0, 1, argz[1], 0,
    0, 0, 1, 0,
    0, 0, pa.z, 1
  ]
  const styles = []
  styles.push(`${selector}{
    position:absolute;
    left:${left}px;
    top:${top}px;
    width:${right - left}px;
    height:${bottom - top}px;
    overflow:hidden;
    transform-origin:${round(pa.x - left)}px ${round(pa.y - top)}px;
    transform:matrix3d(${matrix.map(v => round(v, 100000)).join(',')});
  }`)


  const trans = [[pa, pb, pc], [pb, pc, pa], [pc, pa, pb]].map(([pa, pb, pc], i) => {
    const thb = Math.atan2(pb.y - pa.y, pb.x - pa.x)
    const cosb = Math.cos(thb)
    const sinb = Math.sin(thb)
    const [pb2, pc2] = [pb, pc].map(({ x, y }) => ({ x: (x - pa.x) * cosb + (y - pa.y) * sinb, y: -(x - pa.x) * sinb + (y - pa.y) * cosb }))
    console.log(pb2, pc2, matrix)
    const xs2 = [0, pb2.x, pc2.x]
    const ys2 = [0, pb2.y, pc2.y]
    const rect2 = {
      left: Math.floor(Math.min(...xs2)) - 1,
      right: Math.ceil(Math.max(...xs2)) + 1,
      top: Math.floor(Math.min(...ys2)) - 1,
      bottom: Math.ceil(Math.max(...ys2)) + 1
    }
    console.log(rect2, pa, pb, pc)
    return {
      w: rect2.right - rect2.left,
      h: rect2.bottom - rect2.top,
      rotate: thb,
      translate: { x: pa.x - left + rect2.left * cosb - rect2.top * sinb, y: pa.y - top + rect2.top * cosb + rect2.left * sinb }
    }
  })

  let tr = { th: 0, x: 0, y: 0 }
  for (let i = 0; i < 4; i++) {
    const s = ['i', 'i>i', 'i>i>i'][i]
    const { rotate, translate, w, h } = trans[i] || { rotate: 0, translate: { x: -left, y: -top } }
    const cos = Math.cos(tr.th)
    const sin = Math.sin(tr.th)
    const th = rotate - tr.th
    const tx = cos * (translate.x - tr.x) + sin * (translate.y - tr.y)
    const ty = cos * (translate.y - tr.y) - sin * (translate.x - tr.x)
    if (s) {
      tr = { th: rotate, ...translate }
      styles.push(`${selector}>${s}{
        position:absolute;
        left:0;
        top:0;
        width:${w}px;
        height:${h}px;
        transform:translate(${round(tx)}px,${round(ty)}px) rotate(${round(th * 180 / Math.PI)}deg);
        transform-origin:0 0;
        overflow:hidden;
      }`)
    } else {
      styles.push(`${selector}>i>i>i:before{
        content: '';
        position:absolute;
        left:0;
        top:0;
        width:${right}px;
        height:${bottom}px;
        transform:translate(${round(tx)}px,${round(ty)}px) rotate(${round(th * 180 / Math.PI)}deg);
        transform-origin:0 0;
        overflow:hidden;
      }`)
    }
  }

  const style = document.createElement('style')
  style.textContent=styles.join('')
  document.head.appendChild(style)
  

}

// polygon(
//   { x: 100, y: 120, z: 100 },
//   { x: 400, y: 210, z: 100 },
//   { x: 150, y: 520, z: 100 },
//   '#view>i:nth-child(1)'
// )
// polygon(
//   { x: 150, y: 520, z: 100 },
//   { x: 400, y: 210, z: 100 },
//   { x: 500, y: 400, z: 100 },
//   '#view>i:nth-child(2)'
// )

// polygon(
//   { x: 200, y: 200, z: 200 },
//   { x: 400, y: 400, z: 100 },
//   { x: 400, y: 200, z: 0 },
//   '#view>i:nth-child(3)'
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
  { x: 615, y: 505, z: 0 }
]
const hratio = 3 / 5
let count = 0
const stairs = [
  [{ x: 650, y: 500 }, { x: 670, y: 440 }],
  [{ x: 680, y: 430 }, { x: 770, y: 400 }],
  [{ x: 770, y: 400 }, { x: 700, y: 190 }]
].map(ps => ps.map(({ x, y }) => ({ x, y, z: (500 - y) * hratio })))
console.log(stairs)
const center = { x: 250, y: 250, z: 250 * hratio }
const cs = [stairs[2][1], stairs[1][1], stairs[1][0], stairs[0][1], ...outline.slice(0, 5)]
for (let i = 0; i < cs.length - 1; i++) {
  console.log(cs[i], cs[i+1], center)
  polygon(cs[i], cs[i+1], center, `#view>i:nth-child(${++count})`)
}
