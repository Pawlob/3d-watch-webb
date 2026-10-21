import React, { useMemo, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Model } from './Model';
import { Custom3DModel } from '../types/builder';

interface DynamicModelProps {
  model?: Custom3DModel | null;
  isPlaying?: boolean;
  activeAnimationClip?: string;
  animationSpeed?: number;
  onDiscoveredClips?: (clips: string[]) => void;
  [key: string]: any;
}

/**
 * Normalizes model geometry to center at (0, 0, 0) and fit comfortably into standard bounds (~2.4 units)
 */
function normalizeObject(object: THREE.Object3D, targetSize = 2.4) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  if (maxDim > 0) {
    const scaleFactor = targetSize / maxDim;
    object.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  // Recalculate box after scaling to center accurately
  const updatedBox = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  updatedBox.getCenter(center);
  object.position.sub(center);
}

/**
 * Procedural Prismatic Crystal sculpture
 */
function ProceduralCrystal({ isPlaying = true, speed = 1 }: { isPlaying?: boolean; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    const currentSpeed = speed || 1;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2 * currentSpeed;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.4 * currentSpeed;
      innerRef.current.rotation.x += delta * 0.2 * currentSpeed;
    }
  });

  return (
    <group scale={1.2}>
      {/* Outer Faceted Diamond / Quartz */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.4, 1]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.05}
          metalness={0.1}
          transmission={0.92}
          thickness={1.5}
          ior={1.75}
          reflectivity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent={true}
          opacity={0.95}
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </mesh>
    </group>
  );
}

/**
 * Procedural Cyber Torus Core
 */
function ProceduralTorus({ isPlaying = true, speed = 1 }: { isPlaying?: boolean; speed?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerKnotRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    const currentSpeed = speed || 1;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3 * currentSpeed;
    }
    if (innerKnotRef.current) {
      innerKnotRef.current.rotation.x += delta * 0.4 * currentSpeed;
      innerKnotRef.current.rotation.y += delta * 0.5 * currentSpeed;
    }
  });

  return (
    <group scale={0.9}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.3, 0.25, 24, 64]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.95}
          envMapIntensity={1.5}
        />
      </mesh>

      <mesh ref={innerKnotRef}>
        <torusKnotGeometry args={[0.7, 0.2, 128, 32, 2, 3]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
    </group>
  );
}

/**
 * Procedural Quantum Kinetic Sphere
 */
function ProceduralQuantumCore({ isPlaying = true, speed = 1 }: { isPlaying?: boolean; speed?: number }) {
  const g1Ref = useRef<THREE.Group>(null);
  const g2Ref = useRef<THREE.Group>(null);
  const g3Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    const currentSpeed = speed || 1;
    if (g1Ref.current) g1Ref.current.rotation.x += delta * 0.6 * currentSpeed;
    if (g2Ref.current) g2Ref.current.rotation.y += delta * 0.5 * currentSpeed;
    if (g3Ref.current) g3Ref.current.rotation.z += delta * 0.4 * currentSpeed;
  });

  return (
    <group scale={1.1}>
      {/* Central Polished Core */}
      <mesh>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.98}
          roughness={0.05}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Gimbal Ring 1 */}
      <group ref={g1Ref}>
        <mesh>
          <torusGeometry args={[1.05, 0.05, 16, 64]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Gimbal Ring 2 */}
      <group ref={g2Ref}>
        <mesh>
          <torusGeometry args={[1.25, 0.05, 16, 64]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Gimbal Ring 3 */}
      <group ref={g3Ref}>
        <mesh>
          <torusGeometry args={[1.45, 0.05, 16, 64]} />
          <meshStandardMaterial color="#ec4899" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Component to load and display an arbitrary uploaded 3D file (.glb, .gltf, .obj) with GLTF animation support
 */
function CustomUploadedModelView({
  model,
  isPlaying = true,
  selectedClipName,
  speed = 1,
  onDiscoveredClips,
}: {
  model: Custom3DModel;
  isPlaying?: boolean;
  selectedClipName?: string;
  speed?: number;
  onDiscoveredClips?: (clips: string[]) => void;
}) {
  const [loadedData, setLoadedData] = useState<{
    scene: THREE.Object3D;
    animations: THREE.AnimationClip[];
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const isObj = model.type === 'obj' || model.fileName?.toLowerCase().endsWith('.obj');

    if (isObj) {
      const loader = new OBJLoader();
      loader.load(
        model.url,
        (obj) => {
          if (isCancelled) return;
          obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: '#94a3b8',
                  metalness: 0.6,
                  roughness: 0.3,
                });
              }
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          if (model.autoNormalizeScale !== false) {
            normalizeObject(obj);
          }
          setLoadedData({ scene: obj, animations: [] });
          setIsLoading(false);
        },
        undefined,
        (err) => {
          if (isCancelled) return;
          console.error('Error loading OBJ:', err);
          setLoadError('Failed to parse OBJ file.');
          setIsLoading(false);
        }
      );
    } else {
      // GLTF / GLB Loader
      const loader = new GLTFLoader();
      loader.load(
        model.url,
        (gltf) => {
          if (isCancelled) return;
          const scene = gltf.scene;

          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          if (model.autoNormalizeScale !== false) {
            normalizeObject(scene);
          }

          const clips = gltf.animations || [];
          const clipNames = clips.map((c, i) => c.name || `Animation ${i + 1}`);

          if (onDiscoveredClips && clipNames.length > 0) {
            onDiscoveredClips(clipNames);
          }

          setLoadedData({ scene, animations: clips });
          setIsLoading(false);
        },
        undefined,
        (err) => {
          if (isCancelled) return;
          console.error('Error loading GLTF/GLB:', err);
          setLoadError('Failed to parse GLTF/GLB model.');
          setIsLoading(false);
        }
      );
    }

    return () => {
      isCancelled = true;
    };
  }, [model.url, model.type, model.autoNormalizeScale, model.fileName]);

  // Set up AnimationMixer when scene & animations are ready
  useEffect(() => {
    if (!loadedData || !loadedData.scene || loadedData.animations.length === 0) {
      mixerRef.current = null;
      return;
    }

    const mixer = new THREE.AnimationMixer(loadedData.scene);
    mixerRef.current = mixer;

    const clips = loadedData.animations;
    let targetClip = clips[0];

    const clipToFind = selectedClipName || model.selectedAnimation;
    if (clipToFind) {
      const found = clips.find((c) => c.name === clipToFind);
      if (found) targetClip = found;
    }

    if (targetClip) {
      const action = mixer.clipAction(targetClip);
      action.reset().fadeIn(0.2).play();
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [loadedData, selectedClipName, model.selectedAnimation]);

  // Advance animation mixer on every frame
  useFrame((_, delta) => {
    if (mixerRef.current && isPlaying) {
      mixerRef.current.update(delta * (speed || 1));
    }
  });

  if (loadError) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#ef4444" wireframe={true} />
        </mesh>
      </group>
    );
  }

  if (isLoading || !loadedData) {
    return (
      <group>
        <mesh>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#38bdf8" wireframe={true} opacity={0.6} transparent={true} />
        </mesh>
      </group>
    );
  }

  return <primitive object={loadedData.scene} dispose={null} />;
}

export function DynamicModel({
  model,
  isPlaying,
  activeAnimationClip,
  animationSpeed,
  onDiscoveredClips,
  ...props
}: DynamicModelProps) {
  // Determine effective play state: paused if either global model.playAnimation or section isPlaying is false
  const modelPlay = model?.playAnimation !== false;
  const effectiveIsPlaying = isPlaying !== undefined ? (isPlaying && modelPlay) : modelPlay;
  const effectiveClip = activeAnimationClip || model?.selectedAnimation;
  const effectiveSpeed = animationSpeed ?? model?.animationSpeed ?? 1;

  // If no model or default phone model
  if (!model || model.id === 'iphone-default' || model.url === 'default') {
    return <Model {...props} />;
  }

  // Presets
  if (model.id === 'preset-crystal' || model.url === 'preset:crystal') {
    return <ProceduralCrystal isPlaying={effectiveIsPlaying} speed={effectiveSpeed} {...props} />;
  }

  if (model.id === 'preset-torus' || model.url === 'preset:torus') {
    return <ProceduralTorus isPlaying={effectiveIsPlaying} speed={effectiveSpeed} {...props} />;
  }

  if (model.id === 'preset-core' || model.url === 'preset:core') {
    return <ProceduralQuantumCore isPlaying={effectiveIsPlaying} speed={effectiveSpeed} {...props} />;
  }

  // Custom uploaded model (.glb, .gltf, .obj)
  return (
    <CustomUploadedModelView
      model={model}
      isPlaying={effectiveIsPlaying}
      selectedClipName={effectiveClip}
      speed={effectiveSpeed}
      onDiscoveredClips={onDiscoveredClips}
      {...props}
    />
  );
}
