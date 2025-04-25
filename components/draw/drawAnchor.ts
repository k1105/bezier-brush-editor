import type p5 from "p5";
import {Vec} from "@/lib/geometry";

export function drawAnchor(
  p: p5,
  pos: Vec,
  state: "inactive" | "selected" | "hover"
) {
  p.noFill();
  p.stroke(255);
  p.strokeWeight(1);

  if (state === "inactive") {
    p.circle(pos.x, pos.y, 10);
  } else {
    p.fill("#ff006e");
    p.strokeWeight(state === "selected" ? 3 : 1);
    p.circle(pos.x, pos.y, 10);
  }
}
