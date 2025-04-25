import {Vec, CubicPath, cubicPoint} from "../geometry";
import type p5 from "p5";

export interface AnimationStrategy {
  draw(
    p: p5,
    path: CubicPath,
    circles: {path: CubicPath; idx: number; r: number}[],
    currentFrame: number,
    totalFrames: number,
    pointsToShow: number
  ): void;
}

export class DefaultAnimationStrategy implements AnimationStrategy {
  private readonly STEP_GEOM = 0.005;
  private readonly K_BLEND = 1000;

  draw(
    p: p5,
    path: CubicPath,
    circles: {path: CubicPath; idx: number; r: number}[],
    currentFrame: number,
    totalFrames: number,
    pointsToShow: number
  ): void {
    const A = path.anchors;
    if (A.length < 2) return;
    const rArr = A.map((_, i) => {
      const f = circles.find((c) => c.path === path && c.idx === i);
      return f ? f.r : 0;
    });

    // 長さテーブル
    const pts: Vec[] = [];
    const lens = [0];
    const aLen = [0];
    let L = 0;
    for (let i = 0; i < A.length - 1; i++) {
      const P0 = A[i].pos;
      const P3 = A[i + 1].pos;
      const P1 = A[i].out || P0;
      const P2 = A[i + 1].in || P3;
      let prev = P0.copy();
      for (let t = this.STEP_GEOM; t <= 1.00001; t += this.STEP_GEOM) {
        const point = cubicPoint(P0, P1, P2, P3, t);
        L += Vec.dist(prev, point);
        pts.push(point);
        lens.push(L);
        prev = point;
      }
      aLen.push(L);
    }
    if (L === 0) return;

    p.noStroke();
    p.fill(255);

    for (let k = 0; k < pointsToShow; k++) {
      const target = (L * k) / (this.K_BLEND - 1);
      let j = 0;
      while (j < lens.length && lens[j] < target) j++;
      const point = pts[Math.min(j, pts.length - 1)];

      let next = aLen.findIndex((v) => v >= target);
      if (next === -1) next = aLen.length - 1;
      const prev = Math.max(0, next - 1);
      const l0 = aLen[prev];
      const l1 = aLen[next];
      const r0 = rArr[prev];
      const r1 = rArr[next];
      const t = l1 === l0 ? 0 : (target - l0) / (l1 - l0);

      // C2 continuityを実現する補完
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      // 隣接する円の半径の変化率を考慮
      const r0_deriv =
        prev > 0
          ? (rArr[prev] - rArr[prev - 1]) / (aLen[prev] - aLen[prev - 1])
          : 0;
      const r1_deriv =
        next < rArr.length - 1
          ? (rArr[next + 1] - rArr[next]) / (aLen[next + 1] - aLen[next])
          : 0;

      const r =
        h00 * r0 +
        h10 * (l1 - l0) * r0_deriv +
        h01 * r1 +
        h11 * (l1 - l0) * r1_deriv;
      if (r > 0.5) p.circle(point.x, point.y, r * 2);
    }
  }
}

export class BackAndForthAnimationStrategy implements AnimationStrategy {
  private readonly STEP_GEOM = 0.005;
  private readonly K_BLEND = 1000;

  draw(
    p: p5,
    path: CubicPath,
    circles: {path: CubicPath; idx: number; r: number}[],
    currentFrame: number,
    totalFrames: number
    // pointsToShow: number
  ): void {
    const A = path.anchors;
    if (A.length < 2) return;
    const rArr = A.map((_, i) => {
      const f = circles.find((c) => c.path === path && c.idx === i);
      return f ? f.r : 0;
    });

    // 長さテーブル
    const pts: Vec[] = [];
    const lens = [0];
    const aLen = [0];
    let L = 0;
    for (let i = 0; i < A.length - 1; i++) {
      const P0 = A[i].pos;
      const P3 = A[i + 1].pos;
      const P1 = A[i].out || P0;
      const P2 = A[i + 1].in || P3;
      let prev = P0.copy();
      for (let t = this.STEP_GEOM; t <= 1.00001; t += this.STEP_GEOM) {
        const point = cubicPoint(P0, P1, P2, P3, t);
        L += Vec.dist(prev, point);
        pts.push(point);
        lens.push(L);
        prev = point;
      }
      aLen.push(L);
    }
    if (L === 0) return;

    p.noStroke();
    p.fill(255);

    // 往復アニメーションの実装
    const isForward = currentFrame < totalFrames;
    const progress = isForward
      ? currentFrame / totalFrames
      : 2 - currentFrame / totalFrames;

    // 進行度に応じて表示する円の数を計算
    const effectivePointsToShow = Math.floor(this.K_BLEND * progress);

    for (let k = 0; k < effectivePointsToShow; k++) {
      const target = (L * k) / (this.K_BLEND - 1);
      let j = 0;
      while (j < lens.length && lens[j] < target) j++;
      const point = pts[Math.min(j, pts.length - 1)];

      let next = aLen.findIndex((v) => v >= target);
      if (next === -1) next = aLen.length - 1;
      const prev = Math.max(0, next - 1);
      const l0 = aLen[prev];
      const l1 = aLen[next];
      const r0 = rArr[prev];
      const r1 = rArr[next];
      const t = l1 === l0 ? 0 : (target - l0) / (l1 - l0);

      // C2 continuityを実現する補完
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      // 隣接する円の半径の変化率を考慮
      const r0_deriv =
        prev > 0
          ? (rArr[prev] - rArr[prev - 1]) / (aLen[prev] - aLen[prev - 1])
          : 0;
      const r1_deriv =
        next < rArr.length - 1
          ? (rArr[next + 1] - rArr[next]) / (aLen[next + 1] - aLen[next])
          : 0;

      const r =
        h00 * r0 +
        h10 * (l1 - l0) * r0_deriv +
        h01 * r1 +
        h11 * (l1 - l0) * r1_deriv;
      if (r > 0.5) p.circle(point.x, point.y, r * 2);
    }
  }
}
