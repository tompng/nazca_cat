const curveStyles = []
const curveBackgrounds = []
let curveColor = 'red'
function solve2(a, b, c, d, x, y) {
  const det = a * d - b * c
  return [(d * x - b * y) / det, (a * y - c * x) / det]
}
function normalizeRadian(th, from = -Math.PI) {
  return th - Math.floor((th - from) / 2 / Math.PI) * 2 * Math.PI
}
function thetaDiff(t1, t2) {
  return normalizeRadian(t2 - t1)
}
function splitCircle({ x, y, r, thStart, thEnd }) {
  if (thStart > thEnd) [thStart, thEnd] = [thEnd, thStart]
  const circles = []
  while (thStart < thEnd) {
    const t2 = Math.min(thEnd, (Math.floor(thStart / (Math.PI / 2)) + 1)* Math.PI / 2)
    circles.push({ x, y, r, thStart, thEnd: t2 })
    thStart = t2
  }
  return circles
}
function curveToArcs(p1, p2) {
  const th = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  const cos1 = Math.cos(p1.th)
  const sin1 = Math.sin(p1.th)
  const cos2 = Math.cos(p2.th)
  const sin2 = Math.sin(p2.th)
  const length = Math.hypot(p2.x - p1.x, p2.y - p1.y)

  const s1 = Math.sin(p1.th - th)
  const c1 = Math.cos(p1.th - th)
  const s2 = Math.sin(p2.th - th)
  const c2 = Math.cos(p2.th - th)
  if (s1 * s2 < 0) {
    // r1*s1+r2*(-s2)=length
    // r1*(1-c1)=r2*(1-c2)
    // a+b=length
    // a*x=b*y
    const a = s2 * (1 - c1)
    const b = -s1 * (1 - c2)
    const r1 = length * b / (a + b) / s1
    const r2 = -length * a / (a + b) / s2
    return [
      {
        x: p1.x + r1 * sin1,
        y: p1.y - r1 * cos1,
        r: Math.abs(r1),
        ...(
          r1 > 0 ? {
            thStart: th + Math.PI / 2,
            thEnd: th + Math.PI / 2 + normalizeRadian(p1.th - th)
          } : {
            thStart: p1.th - Math.PI / 2,
            thEnd: p1.th - Math.PI / 2 + normalizeRadian(th - p1.th)
          }
        )
      },
      {
        x: p2.x + r2 * sin2,
        y: p2.y - r2 * cos2,
        r: Math.abs(r2),
        ...(
          r2 > 0 ? {
            thStart: p2.th + Math.PI / 2,
            thEnd: p2.th + Math.PI / 2 + normalizeRadian(th - p2.th)
          } : {
            thStart: th - Math.PI / 2,
            thEnd: th - Math.PI / 2 + normalizeRadian(p2.th - th)
          }
        )
      }
    ]
  }
  // |(p1+v1*r1)-(p2-v2*r2)|=2*r
  // a*r*r+b*r+c=0
  const a = 4 - (cos1 + cos2) ** 2 - (sin1 + sin2) ** 2
  const b = 2 * ((p2.x - p1.x) * (sin1 + sin2) - (p2.y - p1.y) * (cos1 + cos2))
  const c = -(length ** 2)
  const ra = b / a / 2
  const rb = Math.sqrt(b * b - 4 * a * c) / a / 2
  const r = Math.abs(a) < 1e-8 ? c / b : ra > 0 ? ra - rb : ra + rb
  const circle1 = { x: p1.x - r * sin1, y: p1.y + r * cos1, r: Math.abs(r) }
  const circle2 = { x: p2.x + r * sin2, y: p2.y - r * cos2, r: Math.abs(r) }
  const th2 = Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x)
  return [
    {
      ...circle1,
      ...(
        r > 0 ? {
          thStart: p1.th - Math.PI / 2,
          thEnd: p1.th - Math.PI / 2 + normalizeRadian(th2 - p1.th + Math.PI / 2, 0 * Math.PI),
        } : {
          thStart: p1.th + Math.PI / 2,
          thEnd: p1.th + Math.PI / 2 + normalizeRadian(th2 - p1.th - Math.PI / 2, -1 * Math.PI),
        }
      ),
    },
    {
      ...circle2,
      ...(
        r > 0 ? {
          thStart: p2.th + Math.PI / 2,
          thEnd: p2.th + Math.PI / 2 + normalizeRadian(th2 - p2.th + Math.PI / 2, 0 * Math.PI)
        } : {
          thStart: th2 - Math.PI,
          thEnd: th2 - Math.PI + normalizeRadian(p2.th - th2 + Math.PI / 2, 0 * Math.PI)
        }
      ),
    }
  ]
}
function curveToSegments(p1, p2, recursive = true) {
  const cos1 = Math.cos(p1.th)
  const sin1 = Math.sin(p1.th)
  const cos2 = Math.cos(p2.th)
  const sin2 = Math.sin(p2.th)
  const th = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  const length = Math.hypot(p2.x - p1.x, p2.y - p1.y)
  const thDiff = normalizeRadian(p2.th - p1.th)
  if (Math.max(Math.abs(normalizeRadian(p2.th - th)), Math.abs(normalizeRadian(p1.th - th))) < 1e-5) {
    return [[{ ...p1, length }], []]
  }
  let [la, lb] = solve2(cos1, cos2, sin1, sin2, p2.x - p1.x, p2.y - p1.y)
  if (la < length / 8 || lb < length / 8 && recursive) {
    const a = { x: p1.x + cos1 * length / 3, y: p1.y + sin1 * length / 3 }
    const b = { x: p2.x - cos2 * length / 3, y: p2.y - sin2 * length / 3 }
    const th2 = Math.atan2(b.y - a.y, b.x - a.x)
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, th: th2 }
    const [ls1, cs1] = curveToSegments(p1, center, false)
    const [ls2, cs2] = curveToSegments(center, p2, false)
    return [[...ls1, ...ls2], [...cs1, ...cs2]]
  }
  if (la < 0 || lb < 0) return [[{ ...p1, length }], []]
  const r = Math.min(la, lb) * Math.tan((Math.PI - Math.abs(thDiff)) / 2)
  const base = la < lb ? p1 : p2
  const dir = thDiff > 0 ? 1 : -1
  const cx = base.x - r * dir * Math.sin(base.th)
  const cy = base.y + r * dir * Math.cos(base.th)
  let thStart = normalizeRadian(base.th - dir * Math.PI / 2)
  let thEnd = thStart + (la < lb ? 1 : -1) * thDiff
  const line = { ...(la < lb ? p2 : p1), length: la - lb }
  const circles = splitCircle({ x: cx, y: cy, r, thStart, thEnd })
  return [[line], circles]
}
let parentSelector = null
function addCSSElement(base, before) {
  const el = document.createElement('i')
  const parent = document.querySelector(parentSelector || 'body')
  parent.appendChild(el)
  const selector = `${parentSelector ? parentSelector + ' ' : ''}i:nth-child(${parent.querySelectorAll('i').length})`
  function cssToString(css) {
    const rules = []
    for (const key in css) {
      const value = ['left', 'top', 'width', 'height'].includes(key) ? round(css[key]) + 'px' : css[key]
      rules.push(key.replace(/[A-Z]/, v => '-' + v.toLocaleLowerCase()) + ':' + value + ';')
    }
    return rules.join('')
  }
  curveStyles.push(`${selector}{${cssToString(base)}}`)
  curveStyles.push(`${selector}:before{${cssToString(before)}}`)
}
function addLineCap({ x, y }, w) {
  const lx = x - w / 2
  const ly = y - w / 2
  addCSSElement(
    { left: Math.floor(lx), top: Math.floor(ly), width: w + 1, height: w + 1 },
    {
      left: 0, top: 0, width: w, height: w,
      borderRadius: '50%',
      transform: `translate(${lx - Math.floor(lx)}px,${ly - Math.floor(ly)}px)`,
      border: 'none',
      background: curveColor
    }
  )
  addCircleBackground(x - w / 2, y - w / 2, w, w, x, y, w / 2)
}
function round(v, n = 100) {
  return Math.round(v * n) / n
}
function addArc({ x, y, r, thStart, thEnd }, w) {
  const xs = []
  const ys = []
  ;[thStart, thEnd].forEach(th => {
    [-1, 1].forEach(wdir => {
      xs.push(x + (r + wdir * w / 2) * Math.cos(th))
      ys.push(y + (r + wdir * w / 2) * Math.sin(th))
    })
  })
  const left = Math.floor(Math.min(...xs))
  const top = Math.floor(Math.min(...ys))
  const cx = x - left - r - w / 2
  const cy = y - top - r - w / 2
  const csize = 2 * r + w
  const icx = Math.floor(cx)
  const icy = Math.floor(cy)
  const icsize = Math.floor(csize)
  addCSSElement(
    { left, top, width: Math.ceil(Math.max(...xs) - left), height: Math.ceil(Math.max(...ys) - top) },
    {
      left: icx, top: icy, width: icsize, height: icsize,
      transform: `translate(${round(cx - icx + (csize - icsize) / 2)}px,${round(cy - icy + (csize - icsize) / 2)}px)scale(${round(csize / icsize, 10000)})`,
      borderWidth: `${w}px`,
      borderRadius: '50%',
    }
  )
  addCircleBackground(
    Math.min(...xs),
    Math.min(...ys),
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    x,
    y,
    r,
    w
  )
}
function addCircleBackground(x, y, w, h, cx, cy, r, lw) {
  const d = 0.25
  let color = `blue ${round(r - d)}px,transparent ${round(r + d)}px`
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iw = Math.ceil(x + w) - ix
  const ih = Math.ceil(y + h) - iy
  if (lw !== undefined){
    const r1 = round(r - lw / 2)
    const r2 = round(r + lw / 2)
    color = `transparent ${round(r - lw / 2 - d)}px,blue ${round(r - lw / 2 + d)}px,blue ${round(r + lw / 2 - d)}px,transparent ${round(r + lw / 2 + d)}px`
  }
  curveBackgrounds.push(`radial-gradient(circle at ${round(cx-ix)}px ${round(cy-iy)}px,${color}) ${ix}px ${iy}px/${iw}px ${ih}px no-repeat`)
}
function addLineWithCap({ x, y, length, th }, w){
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  const xs = [x, x + length * cos]
  const ys = [y, y + length * sin]
  const left = Math.floor(Math.min(...xs) - w / 2)
  const top = Math.floor(Math.min(...ys) - w / 2)
  const center = { x: x + cos * length / 2, y: y + sin * length / 2 }
  const width = Math.ceil(Math.abs(length) + w)
  const lx = center.x - left - width / 2
  const ly = center.y - top - w / 2
  addCSSElement(
    { left, top, width: Math.ceil(Math.max(...xs) + w - left), height: Math.ceil(Math.max(...ys) + w - top) },
    {
      left: Math.floor(lx),
      top: Math.floor(ly),
      width,
      height: w,
      borderRadius: `${w / 2}px`,
      transform: `translate(${round(lx - Math.floor(lx))}px,${round(ly - Math.floor(ly))}px)rotate(${round(th * 180 / Math.PI, 1000)}deg)`,
      background: curveColor,
      border: 'none',
    }
  )
  ;[0, 1].forEach(i => {
    const x = xs[i]
    const y = ys[i]
    addCircleBackground(x - w / 2, y - w / 2, w, w, x, y, w / 2)
  })
  addLineBackground(x, y, length, th, w)
}
function addLine({ x, y, length, th }, w, cap = false){
  const xs = []
  const ys = []
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  ;[0, 1].forEach(t => {
    [-1, 1].forEach(wdir => {
      xs.push(x + t * length * cos + wdir * w / 2 * sin)
      ys.push(y + t * length * sin - wdir * w / 2 * cos)
    })
  })
  const left = Math.floor(Math.min(...xs))
  const top = Math.floor(Math.min(...ys))
  const center = { x: x + cos * length / 2, y: y + sin * length / 2 }
  const width = Math.ceil(Math.abs(length) + w)
  const lx = center.x - left - width / 2
  const ly = center.y - top - w / 2
  addCSSElement(
    { left, top, width: Math.ceil(Math.max(...xs) - left), height: Math.ceil(Math.max(...ys) - top) },
    {
      left: Math.floor(lx),
      top: Math.floor(ly),
      width,
      height: w,
      transform: `translate(${round(lx - Math.floor(lx))}px,${round(ly - Math.floor(ly))}px)rotate(${round(th * 180 / Math.PI, 1000)}deg)`,
      background: curveColor,
      border: 'none',
    }
  )
  addLineBackground(x, y, length, th, w)
}
function addLineBackground(x, y, length, th, w) {
  const xs = []
  const ys = []
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  ;[0, 1].forEach(t => {
    [-1, 1].forEach(wdir => {
      xs.push(x + t * length * cos + wdir * w / 2 * sin)
      ys.push(y + t * length * sin - wdir * w / 2 * cos)
    })
  })
  const left = Math.floor(Math.min(...xs))
  const top = Math.floor(Math.min(...ys))
  const right = Math.ceil(Math.max(...xs))
  const bottom = Math.ceil(Math.max(...ys))
  const pxs = []
  ;[left, right].forEach(px => {
    ;[top, bottom].forEach(py => {
      pxs.push((py - y) * cos - (px - x) * sin)
    })
  })
  const min = Math.min(...pxs)
  const stop1 = -w / 2 - min
  const stop2 = w / 2 - min
  const d = 0.25
  const color = `transparent ${round(stop1 - d)}px,blue ${round(stop1 + d)}px,blue ${round(stop2 - d)}px,transparent ${round(stop2 + d)}px`
  curveBackgrounds.push(`linear-gradient(${round((th * 180 / Math.PI))}deg,${color}) ${left}px ${top}px/${right - left}px ${bottom - top}px no-repeat`)
}
function addPath(points, w, closed = false) {
  if (points.length === 2) {
    const dx = points[1].x - points[0].x
    const dy = points[1].y - points[0].y
    addLineWithCap({ ...points[0], length: Math.hypot(dx, dy), th: Math.atan2(dy, dx) }, w)
    return
  }
  const size = points.length
  var params = points.map(({ x, y }) => ({ x, y, dx: 0, dy: 0 }))
  for (let n = 0; n < 4; n++) {
    for (let i = 0; i < size; i++) {
      let ia = (i - 1 + size) % size
      let ib = (i + 1) % size
      let k = 4
      if (!closed) {
        if (i === 0) { ia = i; k = 2 }
        if (i === size - 1) { ib = i; k = 2 }
      }
      const cx = 3 * (params[ib].x - params[ia].x)
      const cy = 3 * (params[ib].y - params[ia].y)
      const pa = params[ia]
      const pb = params[ib]
      params[i].dx = (cx - pa.dx - pb.dx) / k
      params[i].dy = (cy - pa.dy - pb.dy) / k
    }
  }
  const pointsWithTheta = params.map(({ x, y, dx, dy }) => ({ x, y, th: Math.atan2(dy, dx) }))
  for (let i = 0; i < size - (closed ? 0 : 1); i++) {
    const a = pointsWithTheta[i]
    const b = pointsWithTheta[(i + 1) % size]
    const circles = curveToArcs(a, b)
    circles.forEach(c => splitCircle(c).forEach(c => addArc(c, w)))
  }
  if (!closed) {
    addLineCap(points[0], w)
    addLineCap(points[points.length - 1], w)
  }
}
