// Vector class
export class Vec {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy(): Vec {
    return new Vec(this.x, this.y);
  }

  add(v: Vec): Vec {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  static add(a: Vec, b: Vec): Vec {
    return new Vec(a.x + b.x, a.y + b.y);
  }

  static sub(a: Vec, b: Vec): Vec {
    return new Vec(a.x - b.x, a.y - b.y);
  }

  static lerp(a: Vec, b: Vec, t: number): Vec {
    return new Vec(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  static dist(a: Vec, b: Vec): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}

// CubicPath class
export class CubicPath {
  anchors: {pos: Vec; in: Vec | null; out: Vec | null}[];
  offset: Vec;

  constructor() {
    this.anchors = [];
    this.offset = new Vec(0, 0);
  }

  addAnchor(v: Vec): void {
    const a = {pos: v.copy(), in: null as Vec | null, out: null as Vec | null};
    const n = this.anchors.length;
    this.anchors.push(a);
    if (n >= 1) {
      const prev = this.anchors[n - 1];
      prev.out = Vec.lerp(prev.pos, a.pos, 1 / 3);
      a.in = Vec.lerp(prev.pos, a.pos, 2 / 3);
    }
  }

  moveAnchor(i: number, d: Vec): void {
    const a = this.anchors[i];
    a.pos.add(d);
    if (a.in) a.in.add(d);
    if (a.out) a.out.add(d);
    const anchorOut = i > 0 && this.anchors[i - 1].out;
    const anchorIn = i < this.anchors.length - 1 && this.anchors[i + 1].in;
    if (anchorOut) anchorOut.add(d);
    if (anchorIn) anchorIn.add(d);
  }

  moveHandle(i: number, w: "in" | "out", p: Vec): void {
    const a = this.anchors[i];
    a[w] = p;
    const mirror = (pt: Vec, c: Vec) => new Vec(c.x * 2 - pt.x, c.y * 2 - pt.y);
    if (w === "out" && a.in) a.in = mirror(p, a.pos);
    if (w === "in" && a.out) a.out = mirror(p, a.pos);
  }

  hitTestAnchor(pt: Vec, r: number): number {
    return this.anchors.findIndex((a) => Vec.dist(a.pos, pt) < r);
  }

  removeAnchor(i: number): void {
    this.anchors.splice(i, 1);
  }
}

// Circle class
export class Circle {
  path: CubicPath;
  idx: number;
  r: number;

  constructor(path: CubicPath, idx: number, r: number = 30) {
    this.path = path;
    this.idx = idx;
    this.r = r;
  }

  pos(): Vec {
    return Vec.add(this.path.anchors[this.idx].pos, this.path.offset);
  }

  contains(pt: Vec): boolean {
    return Vec.dist(this.pos(), pt) <= this.r;
  }

  getControlPoint(): Vec {
    return new Vec(this.pos().x + this.r - 10, this.pos().y);
  }

  containsControlPoint(pt: Vec): boolean {
    const controlPoint = this.getControlPoint();
    return Vec.dist(controlPoint, pt) < 5;
  }

  updateRadiusFromControlPoint(pt: Vec): void {
    const dx = pt.x - this.pos().x;
    const newRadius = Math.max(10, Math.min(100, dx + 10));
    this.r = newRadius;
  }
}

// Utility function
export function cubicPoint(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const u = 1 - t;
  return new Vec(
    p0.x * u * u * u +
      3 * p1.x * u * u * t +
      3 * p2.x * u * t * t +
      p3.x * t * t * t,
    p0.y * u * u * u +
      3 * p1.y * u * u * t +
      3 * p2.y * u * t * t +
      p3.y * t * t * t
  );
}
