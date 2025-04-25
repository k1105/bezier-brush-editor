import styles from "./Controls.module.scss";
import {useState, useEffect} from "react";
import LayerControl from "./LayerControl";
import {Mode, AnimationType, Layer, CanvasState} from "@/types/types";
import {Icon} from "@iconify/react/dist/iconify.js";
import {useLayers} from "@/hooks/useLayers";

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
  updateCanvasState: (updates: Partial<CanvasState>) => void;
}

const Controls = ({
  mode,
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
  updateCanvasState,
}: ControlsProps) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, setIsPlaying]);

  const {removeLayer, renameLayer} = useLayers(
    layers,
    currentLayerIndex,
    (updatedLayers, newIndex) => {
      updateCanvasState({
        layers: updatedLayers,
        currentLayerIndex: newIndex,
      });
    }
  );

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.container}>
      <div
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        className={styles.modeSelectorContainer}
      >
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("bezier");
          }}
          className={`${styles.modeSelectorButton} ${
            mode === "bezier" ? styles.active : ""
          }`}
        >
          <Icon
            icon="ic:baseline-ads-click"
            className={`${styles.modeSelectorIcon} ${
              mode === "bezier" ? styles.active : ""
            }`}
          />
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("circle");
          }}
          className={`${styles.modeSelectorButton} ${
            mode === "circle" ? styles.active : ""
          }`}
        >
          <Icon icon="ic:outline-circle" className={styles.modeSelectorIcon} />
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("preview");
          }}
          className={`${styles.modeSelectorButton} ${
            mode === "preview" ? styles.active : ""
          }`}
        >
          <Icon
            icon="ic:outline-remove-red-eye"
            className={styles.modeSelectorIcon}
          />
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            setMode("translate");
          }}
          className={`${styles.modeSelectorButton} ${
            mode === "translate" ? styles.active : ""
          }`}
        >
          <Icon
            icon="ic:sharp-compare-arrows"
            className={styles.modeSelectorIcon}
          />
        </button>
      </div>
      <div
        className={styles.layerContainer}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <div className={styles.layerActions}>
          <div className={styles.layerActionButtonContainer}>
            <button
              className={styles.layerActionButton}
              onClick={() => {
                console.log("delete layer");
                removeLayer(currentLayerIndex);
              }}
              disabled={layers.length <= 1}
            >
              <Icon icon="ic:baseline-delete" className={styles.icon} />
            </button>
            <button
              className={styles.layerActionButton}
              onClick={() => console.log("copy layer")}
            >
              <Icon
                icon="ic:baseline-control-point-duplicate"
                className={styles.icon}
              />
            </button>
          </div>
          <div className={styles.motionControlContainer}>
            <div onClick={stopPropagation} onMouseDown={stopPropagation}>
              <button
                onClick={(e) => {
                  stopPropagation(e);
                  setIsPlaying(!isPlaying);
                }}
                className={styles.motionControlButton}
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
                  onChange={(e) =>
                    setAnimationSpeed(parseFloat(e.target.value))
                  }
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
                  onChange={(e) =>
                    setAnimationType(e.target.value as AnimationType)
                  }
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                >
                  <option value="default">Default</option>
                  <option value="backAndForth">Back and Forth</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div onClick={stopPropagation} onMouseDown={stopPropagation}>
          {layers.map((layer, index) => {
            const isExpanded = expandedLayers.has(index);
            return (
              <LayerControl
                key={index}
                keyIndex={index}
                isExpanded={isExpanded}
                setExpandedLayers={setExpandedLayers}
                isSelected={index === currentLayerIndex}
                onSelect={() => setCurrentLayerIndex(index)}
                layerName={layer.name}
                onRename={(newName) => renameLayer(index, newName)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Controls;
