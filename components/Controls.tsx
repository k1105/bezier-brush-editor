import styles from "./Controls.module.scss";
import {useState} from "react";
import LayerControl from "./LayerControl";
import {Mode, AnimationType, Layer} from "@/types/types";

interface ControlsProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  layers: Layer[];
  currentLayerIndex: number;
  setCurrentLayerIndex: (index: number) => void;
}

const Controls = ({
  setMode,
  isPlaying,
  setIsPlaying,
  animationSpeed,
  setAnimationSpeed,
  animationType,
  setAnimationType,
  layers,
  currentLayerIndex,
  setCurrentLayerIndex,
}: ControlsProps) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={styles.container}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("bezier");
          }}
        >
          Bézier
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("circle");
          }}
        >
          Circle
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("preview");
          }}
        >
          Preview
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("translate");
          }}
        >
          Translate
        </button>
      </div>
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <label>
          Speed:
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
          />
          {animationSpeed.toFixed(1)}s
        </label>
      </div>
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <label>
          Animation Type:
          <select
            value={animationType}
            onChange={(e) => setAnimationType(e.target.value as AnimationType)}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
          >
            <option value="default">Default</option>
            <option value="backAndForth">Back and Forth</option>
          </select>
        </label>
      </div>
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        {layers.map((_, index) => {
          const isExpanded = expandedLayers.has(index);
          return (
            <LayerControl
              key={index}
              keyIndex={index}
              isExpanded={isExpanded}
              expandedLayers={expandedLayers}
              setExpandedLayers={setExpandedLayers}
              isSelected={index === currentLayerIndex}
              onSelect={() => setCurrentLayerIndex(index)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Controls;
