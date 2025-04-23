import {Circle} from "@/lib/geometry";
import p5 from "p5";

export function drawCircle(p: p5, c: Circle, sel: boolean) {
  const pos = c.pos();
  p.noFill();
  p.stroke(sel ? p.color("#ffb703") : p.color(255, 0, 0));
  p.strokeWeight(sel ? 2 : 1);
  p.circle(pos.x, pos.y, c.r * 2);
}
