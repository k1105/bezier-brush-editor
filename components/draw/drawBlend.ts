import p5 from "p5";
import {CubicPath, Circle} from "@/lib/geometry";
import {AnimationStrategy} from "@/lib/animation/AnimationStrategy";

export function drawBlend(
  p: p5,
  path: CubicPath,
  fps: number,
  sketchAnimationSpeed: number,
  isSketchPlaying: boolean,
  currentCircleIndex: number,
  circles: Circle[],
  animationStrategy: AnimationStrategy
) {
  const totalFrames = fps * sketchAnimationSpeed;
  const pointsToShow = isSketchPlaying
    ? Math.min(Math.floor((currentCircleIndex / totalFrames) * 1000), 1000)
    : 1000;

  animationStrategy.draw(
    p,
    path,
    circles,
    currentCircleIndex,
    totalFrames,
    pointsToShow
  );
}
