function round(v, n=100) {
  return Math.round(v*n)/n
}

function solve2(a, b, c, d, x, y) {
  const det = a * d - b * c
  return [(d * x - b * y) / det, (a * y - c * x) / det]
}

function polygon(pa, pb, pc, selector) {
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
      right: Math.round(Math.max(...xs2)) + 1,
      top: Math.floor(Math.min(...ys2)) - 1,
      bottom: Math.round(Math.max(...ys2)) + 1
    }
    styles.push(`${selector}>i:nth-child(${2+i}){
      position:absolute;
      left:0;
      top:0;
      width:${rect2.right - rect2.left}px;
      height:${rect2.bottom - rect2.top}px;
      transform:translate(${round(pa.x - left)}px,${round(pa.y - top)}px) rotate(${round(thb * 180 / Math.PI)}deg);
      transform-origin:0 0;
    }`)
    return {
      w: rect2.right - rect2.left,
      h: rect2.bottom - rect2.top,
      rotate: thb,
      translate: { x: pa.x - left, y: pa.y - top }
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

polygon(
  { x: 100, y: 120, z: 100 },
  { x: 400, y: 210, z: -100 },
  { x: 150, y: 520, z: 10 },
  '#polygon>i:nth-child(1)'
)
polygon(
  { x: 150, y: 520, z: 10 },
  { x: 400, y: 210, z: -100 },
  { x: 500, y: 400, z: 50 },
  '#polygon>i:nth-child(2)'
)
