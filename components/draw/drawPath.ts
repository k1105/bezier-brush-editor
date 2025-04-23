import {CubicPath, cubicPoint} from "@/lib/geometry";
import p5 from "p5";
import {drawAnchor} from "./drawAnchor";
import {Circle} from "@/lib/geometry";
import {AnimationStrategy} from "@/lib/animation/AnimationStrategy";
import {drawBlend} from "./drawBlend";
export function drawPath(
  p: p5,
  path: CubicPath,
  selectedAnchor: {path: CubicPath; idx: number} | null,
  hoveredAnchor: {path: CubicPath; idx: number} | null,
  mode: string,
  step: number,
  fps: number,
  sketchAnimationSpeed: number,
  isSketchPlaying: boolean,
  currentCircleIndex: number,
  circles: Circle[],
  animationStrategy: AnimationStrategy
) {
  const A = path.anchors;
  if (A.length === 0) return;
  if (A.length === 1) {
    const state =
      selectedAnchor?.path === path && selectedAnchor?.idx === 0
        ? "selected"
        : hoveredAnchor?.path === path && hoveredAnchor?.idx === 0
        ? "hover"
        : "inactive";
    drawAnchor(p, A[0].pos, state);
    return;
  }

  if (mode === "preview") {
    drawBlend(
      p,
      path,
      fps,
      sketchAnimationSpeed,
      isSketchPlaying,
      currentCircleIndex,
      circles,
      animationStrategy
    );
    return;
  }

  drawBlend(
    p,
    path,
    fps,
    sketchAnimationSpeed,
    isSketchPlaying,
    currentCircleIndex,
    circles,
    animationStrategy
  );

  p.stroke(0, 255, 0);
  p.strokeWeight(1);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < A.length - 1; i++) {
    const P0 = A[i].pos;
    const P3 = A[i + 1].pos;
    const P1 = A[i].out || P0;
    const P2 = A[i + 1].in || P3;
    for (let t = 0; t <= 1.0001; t += step) {
      const v = cubicPoint(P0, P1, P2, P3, t);
      p.vertex(v.x, v.y);
    }
  }
  p.endShape();

  p.stroke(180);
  p.strokeWeight(1);
  A.forEach((a) => {
    if (a.in) p.line(a.pos.x, a.pos.y, a.in.x, a.in.y);
    if (a.out) p.line(a.pos.x, a.pos.y, a.out.x, a.out.y);
  });

  A.forEach((a, i) => {
    const state =
      selectedAnchor?.path === path && selectedAnchor?.idx === i
        ? "selected"
        : hoveredAnchor?.path === path && hoveredAnchor?.idx === i
        ? "hover"
        : "inactive";
    drawAnchor(p, a.pos, state);
  });

  p.fill("#4cc9f0");
  p.strokeWeight(1);
  A.forEach((a) => {
    if (a.in) p.circle(a.in.x, a.in.y, 6);
    if (a.out) p.circle(a.out.x, a.out.y, 6);
  });
}
