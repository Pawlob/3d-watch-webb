import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DynamicModel } from './DynamicModel';
import {
  ModelTransform,
  SectionKeyframe,
  Custom3DModel,
  SceneModelItem,
  HotspotAnnotation,
  PRESET_3D_MODELS,
  getDefaultSceneModels,
  getSectionModelTransform,
  getSectionModelVisibility,
} from '../types/builder';
import { getInterpolatedModelTransform } from '../utils/interpolation';

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-full text-xs font-medium backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap select-none">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        Loading 3D Assets...
      </div>
    </Html>
  );
}

interface AnimatedSceneModelProps {
  sceneModel: SceneModelItem;
  modelIndex: number;
  sections: SectionKeyframe[];
  scrollProgress: number;
  isEditMode: boolean;
  activeSectionIndex: number;
  isSelectedForEdit: boolean;
  modelAsset?: Custom3DModel | null;
  onModelRefReady?: (group: THREE.Group | null) => void;
  onDiscoveredClips?: (clips: string[]) => void;
}

function AnimatedSceneModel({
  sceneModel,
  modelIndex,
  sections,
  scrollProgress,
  isEditMode,
  activeSectionIndex,
  isSelectedForEdit,
  modelAsset,
  onModelRefReady,
  onDiscoveredClips,
}: AnimatedSceneModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothedProgressRef = useRef(scrollProgress);

  useEffect(() => {
    if (onModelRefReady && isSelectedForEdit) {
      onModelRefReady(groupRef.current);
    }
  }, [onModelRefReady, isSelectedForEdit]);

  const activeSection = sections[activeSectionIndex] || sections[0];

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth out scroll progress for fluid keyframe transitions and timeline scrubbing
    smoothedProgressRef.current = THREE.MathUtils.lerp(
      smoothedProgressRef.current,
      scrollProgress,
      isEditMode ? Math.min(1, delta * 14) : Math.min(1, delta * 8)
    );

    // Calculate interpolated transform across keyframes
    const { transform: interpolatedTransform, isVisible: isInterpolatedVisible } =
      getInterpolatedModelTransform(
        sections,
        smoothedProgressRef.current,
        sceneModel.id,
        modelIndex
      );

    // Check if user is stationary at the active keyframe adjusting sliders in the sidebar
    const keyframeProgress = sections.length > 1 ? activeSectionIndex / (sections.length - 1) : 0;
    const isAtActiveKeyframe = Math.abs(scrollProgress - keyframeProgress) < 0.02;

    if (isEditMode && isSelectedForEdit && isAtActiveKeyframe) {
      // In Studio Edit Mode, directly sync active model sliders with zero lag
      const directTransform = getSectionModelTransform(activeSection, sceneModel.id, modelIndex);
      const isDirectVisible = getSectionModelVisibility(activeSection, sceneModel.id);

      groupRef.current.position.set(
        directTransform.position[0],
        directTransform.position[1],
        directTransform.position[2]
      );
      groupRef.current.rotation.set(
        directTransform.rotation[0],
        directTransform.rotation[1],
        directTransform.rotation[2]
      );

      const targetScale = isDirectVisible ? Math.max(0, directTransform.scale) : 0;
      if (targetScale <= 0.01) {
        groupRef.current.visible = false;
        groupRef.current.scale.set(0.0001, 0.0001, 0.0001);
      } else {
        groupRef.current.visible = true;
        groupRef.current.scale.set(targetScale, targetScale, targetScale);
      }
      return;
    }

    // Smooth continuous animation during keyframe changes, timeline tour, and scrubbing
    const lerpSpeed = isEditMode ? Math.min(1, delta * 12) : Math.min(1, delta * 8);

    // Smooth Lerp Position
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, interpolatedTransform.position[0], lerpSpeed);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, interpolatedTransform.position[1], lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, interpolatedTransform.position[2], lerpSpeed);

    // Smooth Lerp Rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, interpolatedTransform.rotation[0], lerpSpeed);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, interpolatedTransform.rotation[1], lerpSpeed);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, interpolatedTransform.rotation[2], lerpSpeed);

    // Smooth Lerp Scale
    const currentScale = groupRef.current.scale.x;
    const targetScale = isInterpolatedVisible ? Math.max(0, interpolatedTransform.scale) : 0;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpSpeed);

    if (newScale <= 0.01) {
      groupRef.current.visible = false;
      groupRef.current.scale.set(0.0001, 0.0001, 0.0001);
    } else {
      groupRef.current.visible = true;
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  // Current section animation parameters
  const currentSection = isEditMode
    ? activeSection
    : sections[Math.min(Math.floor(scrollProgress * sections.length), sections.length - 1)] || sections[0];

  const modelAnim = currentSection?.modelAnimations?.[sceneModel.id];
  const isPlaying = modelAnim?.playModelAnimation ?? currentSection?.playModelAnimation ?? true;
  const activeClip = modelAnim?.activeAnimationClip ?? currentSection?.activeAnimationClip;
  const animSpeed = modelAnim?.animationSpeed ?? currentSection?.animationSpeed ?? 1.0;

  return (
    <group ref={groupRef}>
      <DynamicModel
        model={modelAsset}
        isPlaying={isPlaying}
        activeAnimationClip={activeClip}
        animationSpeed={animSpeed}
        onDiscoveredClips={onDiscoveredClips}
      />
    </group>
  );
}

export interface ScrollCanvasProps {
  sections: SectionKeyframe[];
  scrollProgress: number;
  isEditMode: boolean;
  activeSectionIndex?: number;
  activeSectionTransform?: ModelTransform;
  sceneModels?: SceneModelItem[];
  activeEditingModelId?: string;
  activeModel?: Custom3DModel | null;
  allModels?: Custom3DModel[];
  hotspots?: HotspotAnnotation[];
  selectedHotspotId?: string | null;
  onSelectHotspot?: (id: string | null) => void;
  onUpdateHotspot?: (id: string, updated: Partial<HotspotAnnotation>) => void;
  enableOrbitInEdit?: boolean;
  environmentPreset?: 'city' | 'studio' | 'sunset' | 'dawn' | 'night';
  ambientIntensity?: number;
  lightIntensity?: number;
  onCapturePose?: (transform: ModelTransform) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDiscoveredClips?: (clips: string[]) => void;
  onModelRefReady?: (group: THREE.Group | null) => void;
}

export function ScrollCanvas({
  sections,
  scrollProgress,
  isEditMode,
  activeSectionIndex = 0,
  activeSectionTransform,
  sceneModels,
  activeEditingModelId = 'model-1',
  activeModel,
  allModels = PRESET_3D_MODELS,
  hotspots = [],
  selectedHotspotId,
  onSelectHotspot,
  onUpdateHotspot,
  enableOrbitInEdit = false,
  environmentPreset = 'city',
  ambientIntensity = 0.7,
  lightIntensity = 1.2,
  onCapturePose,
  onContextMenu,
  onDiscoveredClips,
  onModelRefReady,
}: ScrollCanvasProps) {
  const isInteractive = isEditMode && enableOrbitInEdit;
  const resolvedSceneModels = sceneModels && sceneModels.length > 0
    ? sceneModels
    : getDefaultSceneModels({ activeModelId: activeModel?.id });

  return (
    <div
      className="w-full h-full relative pointer-events-auto"
      onContextMenu={onContextMenu}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[10, 10, 10]} intensity={lightIntensity} />
        <directionalLight position={[-10, 5, -10]} intensity={lightIntensity * 0.4} />

        <Suspense fallback={<CanvasLoader />}>
          {resolvedSceneModels.map((sm, index) => {
            const asset = allModels.find((m) => m.id === sm.modelAssetId) || (index === 0 ? activeModel : null) || PRESET_3D_MODELS[0];
            const isSelected = isEditMode && sm.id === activeEditingModelId;

            return (
              <AnimatedSceneModel
                key={sm.id}
                sceneModel={sm}
                modelIndex={index}
                sections={sections}
                scrollProgress={scrollProgress}
                isEditMode={isEditMode}
                activeSectionIndex={activeSectionIndex}
                isSelectedForEdit={isSelected}
                modelAsset={asset}
                onDiscoveredClips={onDiscoveredClips}
                onModelRefReady={isSelected ? onModelRefReady : undefined}
              />
            );
          })}

          

          <Environment preset={environmentPreset} />
        </Suspense>

        {isInteractive && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            makeDefault
          />
        )}
      </Canvas>
    </div>
  );
}
