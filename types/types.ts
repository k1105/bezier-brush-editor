import {Vec, CubicPath, Circle} from "@/lib/geometry";

export type Mode = "bezier" | "circle" | "preview" | "translate";
export type AnimationType = "default" | "backAndForth";

export interface Layer {
  path: CubicPath;
  isVisible: boolean;
  name: string;
}

export interface AnimationState {
  isPlaying: boolean;
  animationSpeed: number;
  animationType: AnimationType;
  currentFrame: number;
}

export interface CanvasState {
  mode: Mode;
  currentLayerIndex: number;
  layers: Layer[];
}

export interface MouseState {
  isDragging: boolean;
  lastPosition: Vec | null;
  selectedAnchor: {path: CubicPath; idx: number} | null;
  hoveredAnchor: {path: CubicPath; idx: number} | null;
}

export interface CircleState {
  circles: Circle[];
  selectedCircle: number;
  defaultRadius: number;
}
