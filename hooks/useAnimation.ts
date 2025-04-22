import {useState, useCallback} from "react";
import type {AnimationState, AnimationType} from "@/types/types";
import {
  DefaultAnimationStrategy,
  BackAndForthAnimationStrategy,
  AnimationStrategy,
} from "@/lib/animation/AnimationStrategy";

export const useAnimation = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    animationSpeed: 1,
    animationType: "default",
    currentFrame: 0,
  });

  const updateAnimationState = useCallback(
    (updates: Partial<AnimationState>) => {
      setAnimationState((prev) => ({...prev, ...updates}));
    },
    []
  );

  const getAnimationStrategy = useCallback((): AnimationStrategy => {
    return animationState.animationType === "backAndForth"
      ? new BackAndForthAnimationStrategy()
      : new DefaultAnimationStrategy();
  }, [animationState.animationType]);

  const togglePlay = useCallback(() => {
    setAnimationState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const setAnimationType = useCallback((type: AnimationType) => {
    setAnimationState((prev) => ({
      ...prev,
      animationType: type,
    }));
  }, []);

  const setAnimationSpeed = useCallback((speed: number) => {
    setAnimationState((prev) => ({
      ...prev,
      animationSpeed: speed,
    }));
  }, []);

  const updateFrame = useCallback((frame: number) => {
    setAnimationState((prev) => ({
      ...prev,
      currentFrame: frame,
    }));
  }, []);

  return {
    animationState,
    updateAnimationState,
    getAnimationStrategy,
    togglePlay,
    setAnimationType,
    setAnimationSpeed,
    updateFrame,
  };
};
