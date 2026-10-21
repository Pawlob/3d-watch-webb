export type SectionLayout = 'center' | 'left-text' | 'right-text' | 'split-specs' | 'minimal';

export type SectionTheme = 'light' | 'dark' | 'midnight' | 'titanium' | 'oled';

export type TextLayerOrder = 'front' | 'back';

export interface ModelTransform {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number]; // in radians or degrees (stored in radians for Three.js)
}

export interface SectionSpec {
  label: string;
  value: string;
  detail?: string;
}

export interface ViewportKeyframeOverride {
  titleX?: number;
  titleY?: number;
  textAlign?: 'left' | 'center' | 'right';
  titleSize?: number;
  titleMaxWidth?: number;
  titleLineHeight?: number;
  subtitleSize?: number;
  subtitleMaxWidth?: number;
  subtitleLineHeight?: number;
  badgeSize?: number;
  layout?: SectionLayout;
  modelTransform?: Partial<ModelTransform>;
}

export interface ViewportOverrides {
  mobile?: ViewportKeyframeOverride;
  tablet?: ViewportKeyframeOverride;
  desktop?: ViewportKeyframeOverride;
}

export type BackgroundType = 'solid' | 'linear' | 'radial';

export type RadialGradientPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export interface GradientConfig {
  type: 'linear' | 'radial';
  color1?: string;
  color2?: string;
  color3?: string;
  fromColor?: string;
  toColor?: string;
  angle?: number; // 0 to 360 degrees for linear
  position?: RadialGradientPosition; // for radial
  radialPosition?: RadialGradientPosition; // for radial
  shape?: 'circle' | 'ellipse'; // for radial
}

export interface SectionKeyframe {
  id: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  layout: SectionLayout;
  theme: SectionTheme;
  titleSize: number; // in vw or rem units
  titleMaxWidth?: number; // Title container max-width in % (e.g. 20% to 100%)
  titleLineHeight?: number; // Title line height multiplier (e.g. 0.85 to 2.0)
  subtitleSize?: number; // Subtitle font size in rem (e.g. 0.8rem to 3.0rem)
  subtitleMaxWidth?: number; // Subtitle container max-width in % (e.g. 20% to 100%)
  subtitleLineHeight?: number; // Subtitle line height multiplier (e.g. 1.0 to 2.2)
  badgeSize?: number; // Badge tag font size in rem (e.g. 0.6rem to 1.5rem)
  ctaSize?: number; // CTA button font size in rem
  ctaWidth?: number; // CTA button width in px or %
  titleColor: string;
  textColor?: string;
  titleFontFamily?: string; // Web-safe font family for main title
  subtitleFontFamily?: string; // Web-safe font family for subtitle
  backgroundColor?: string; // Custom hex color overriding default theme background
  backgroundType?: BackgroundType; // 'solid' | 'linear' | 'radial'
  backgroundGradient?: GradientConfig; // Detailed gradient settings
  titleX?: number; // CSS left position offset in %
  titleY?: number; // CSS top position offset in %
  textAlign?: 'left' | 'center' | 'right'; // Auto-layout text alignment relative to viewport
  textLayerOrder?: TextLayerOrder; // 'front' = text above 3D model, 'back' = text behind 3D model
  modelTransform: ModelTransform;
  // Multi-Model 3D Scene Controls (e.g. Model 1, Model 2, Model 3...)
  modelTransforms?: Record<string, ModelTransform>; // Keyed by SceneModelItem.id (e.g. { 'model-1': ..., 'model-2': ... })
  modelVisibilities?: Record<string, boolean>; // Keyed by SceneModelItem.id (true = visible, false = hidden)
  modelAnimations?: Record<string, {
    playModelAnimation?: boolean;
    activeAnimationClip?: string;
    animationSpeed?: number;
  }>;
  viewportOverrides?: ViewportOverrides; // Responsive overrides for Mobile, Tablet, Desktop
  specs?: SectionSpec[];
  // Embedded 3D Animation Controls
  playModelAnimation?: boolean; // Enable or pause model animation
  activeAnimationClip?: string; // Selected GLTF animation clip name
  animationSpeed?: number; // Animation playback speed (0.1x to 3x)
}

export function getSectionBackgroundStyle(
  section?: Partial<SectionKeyframe> | null,
  fallbackThemeMode?: 'dark' | 'light'
): React.CSSProperties {
  if (!section) {
    return {
      backgroundColor: fallbackThemeMode === 'light' ? '#f5f5f5' : '#020617',
    };
  }

  const bgType = section.backgroundType || (section.backgroundGradient ? section.backgroundGradient.type : 'solid');

  if (bgType === 'linear' && section.backgroundGradient) {
    const { color1, color2, color3, fromColor, toColor, angle = 135 } = section.backgroundGradient;
    const c1 = fromColor || color1 || '#0f172a';
    const c2 = toColor || color2 || '#1e3a8a';
    const stops = color3 && color3.trim() ? `${c1}, ${color3}, ${c2}` : `${c1}, ${c2}`;
    const gradientStr = `linear-gradient(${angle}deg, ${stops})`;
    return {
      background: gradientStr,
      backgroundImage: gradientStr,
    };
  }

  if (bgType === 'radial' && section.backgroundGradient) {
    const { color1, color2, color3, fromColor, toColor, position, radialPosition, shape = 'circle' } = section.backgroundGradient;
    const c1 = fromColor || color1 || '#1e293b';
    const c2 = toColor || color2 || '#020617';
    const pos = radialPosition || position || 'center';
    const stops = color3 && color3.trim() ? `${c1}, ${color3}, ${c2}` : `${c1}, ${c2}`;
    const gradientStr = `radial-gradient(${shape} at ${pos}, ${stops})`;
    return {
      background: gradientStr,
      backgroundImage: gradientStr,
    };
  }

  if (section.backgroundColor) {
    return {
      backgroundColor: section.backgroundColor,
      background: section.backgroundColor,
    };
  }

  switch (section.theme) {
    case 'titanium':
      return { backgroundColor: '#1c1917', background: '#1c1917' };
    case 'midnight':
      return { backgroundColor: '#020617', background: '#020617' };
    case 'oled':
      return { backgroundColor: '#000000', background: '#000000' };
    case 'light':
      return { backgroundColor: '#f5f5f5', background: '#f5f5f5' };
    default:
      return { backgroundColor: '#0a0a0a', background: '#0a0a0a' };
  }
}

export interface SceneModelItem {
  id: string; // e.g. "model-1", "model-2", "model-3"
  name: string; // e.g. "Model 1", "Model 2"
  modelAssetId: string; // references Custom3DModel.id (preset or custom uploaded model)
  colorTag?: string; // optional hex or badge color for editor
}

export function getDefaultSceneModels(config?: Partial<WebsiteConfig>): SceneModelItem[] {
  if (config?.sceneModels && config.sceneModels.length > 0) {
    return config.sceneModels;
  }
  return [
    {
      id: 'model-1',
      name: 'Model 1',
      modelAssetId: config?.activeModelId || 'iphone-default',
    },
  ];
}

export function getSectionModelTransform(
  section: SectionKeyframe,
  modelId: string,
  modelIndex = 0
): ModelTransform {
  if (section.modelTransforms && section.modelTransforms[modelId]) {
    return section.modelTransforms[modelId];
  }
  if (modelId === 'model-1') {
    return section.modelTransform;
  }
  // Default offset for model-2, model-3, etc. if not yet specified in this keyframe section:
  // Distribute models horizontally and with subtle depth so they are NEVER stacked on top of each other!
  const index = modelIndex > 0 ? modelIndex : Math.max(1, parseInt(modelId.replace(/\D/g, '') || '2', 10) - 1);
  const side = index % 2 === 1 ? 1 : -1;
  const tier = Math.floor((index - 1) / 2);
  const spreadX = side * (2.0 + tier * 1.5);
  const spreadZ = -0.35 * index;
  const spreadRotY = side * 0.35;
  return {
    scale: Math.round(section.modelTransform.scale * 0.85),
    position: [
      section.modelTransform.position[0] + spreadX,
      section.modelTransform.position[1],
      section.modelTransform.position[2] + spreadZ,
    ],
    rotation: [
      section.modelTransform.rotation[0],
      section.modelTransform.rotation[1] + spreadRotY,
      section.modelTransform.rotation[2],
    ],
  };
}

export function getSectionModelVisibility(
  section: SectionKeyframe,
  modelId: string
): boolean {
  if (section.modelVisibilities && section.modelVisibilities[modelId] !== undefined) {
    return section.modelVisibilities[modelId];
  }
  return true;
}

export function getEffectiveSection(
  section: SectionKeyframe,
  deviceMode: 'desktop' | 'tablet' | 'mobile'
): SectionKeyframe {
  if (!section) return section;

  if (!section.viewportOverrides || !section.viewportOverrides[deviceMode]) {
    // If mobile or tablet and no custom override explicitly set, calculate responsive fallback
    if (deviceMode === 'mobile' && section.modelTransform) {
      const responsiveTransforms: Record<string, ModelTransform> = {};
      if (section.modelTransforms) {
        for (const [mid, tr] of Object.entries(section.modelTransforms)) {
          responsiveTransforms[mid] = {
            ...tr,
            scale: Math.round(tr.scale * 0.72),
            position: [tr.position[0] * 0.4, tr.position[1], tr.position[2]],
          };
        }
      }
      return {
        ...section,
        modelTransform: {
          ...section.modelTransform,
          scale: Math.round(section.modelTransform.scale * 0.72),
          position: [
            section.modelTransform.position[0] * 0.4,
            section.modelTransform.position[1],
            section.modelTransform.position[2],
          ],
        },
        modelTransforms: Object.keys(responsiveTransforms).length > 0 ? responsiveTransforms : section.modelTransforms,
        titleSize: Math.max(3.5, Math.round(section.titleSize * 0.65)),
        subtitleSize: section.subtitleSize ? section.subtitleSize * 0.85 : undefined,
      };
    }
    if (deviceMode === 'tablet' && section.modelTransform) {
      const responsiveTransforms: Record<string, ModelTransform> = {};
      if (section.modelTransforms) {
        for (const [mid, tr] of Object.entries(section.modelTransforms)) {
          responsiveTransforms[mid] = {
            ...tr,
            scale: Math.round(tr.scale * 0.88),
          };
        }
      }
      return {
        ...section,
        modelTransform: {
          ...section.modelTransform,
          scale: Math.round(section.modelTransform.scale * 0.88),
        },
        modelTransforms: Object.keys(responsiveTransforms).length > 0 ? responsiveTransforms : section.modelTransforms,
        titleSize: Math.max(4.5, Math.round(section.titleSize * 0.82)),
      };
    }
    return section;
  }

  const override = section.viewportOverrides[deviceMode]!;
  return {
    ...section,
    titleX: override.titleX !== undefined ? override.titleX : section.titleX,
    titleY: override.titleY !== undefined ? override.titleY : section.titleY,
    textAlign: override.textAlign !== undefined ? override.textAlign : section.textAlign,
    titleSize: override.titleSize !== undefined ? override.titleSize : section.titleSize,
    titleMaxWidth: override.titleMaxWidth !== undefined ? override.titleMaxWidth : section.titleMaxWidth,
    titleLineHeight: override.titleLineHeight !== undefined ? override.titleLineHeight : section.titleLineHeight,
    subtitleSize: override.subtitleSize !== undefined ? override.subtitleSize : section.subtitleSize,
    subtitleMaxWidth: override.subtitleMaxWidth !== undefined ? override.subtitleMaxWidth : section.subtitleMaxWidth,
    subtitleLineHeight: override.subtitleLineHeight !== undefined ? override.subtitleLineHeight : section.subtitleLineHeight,
    badgeSize: override.badgeSize !== undefined ? override.badgeSize : section.badgeSize,
    layout: override.layout !== undefined ? override.layout : section.layout,
    modelTransform: override.modelTransform
      ? {
          scale: override.modelTransform.scale !== undefined ? override.modelTransform.scale : section.modelTransform.scale,
          position: [
            override.modelTransform.position?.[0] ?? section.modelTransform.position[0],
            override.modelTransform.position?.[1] ?? section.modelTransform.position[1],
            override.modelTransform.position?.[2] ?? section.modelTransform.position[2],
          ],
          rotation: [
            override.modelTransform.rotation?.[0] ?? section.modelTransform.rotation[0],
            override.modelTransform.rotation?.[1] ?? section.modelTransform.rotation[1],
            override.modelTransform.rotation?.[2] ?? section.modelTransform.rotation[2],
          ],
        }
      : section.modelTransform,
  };
}

export interface FontFamilyOption {
  id: string;
  label: string;
  family: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
}

export const WEB_SAFE_FONTS: FontFamilyOption[] = [
  {
    id: 'system',
    label: 'Modern Sans (SF Pro / Segoe UI)',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    category: 'sans',
  },
  {
    id: 'geometric-sans',
    label: 'Geometric Sans (Inter / Arial)',
    family: '"Inter", -apple-system, Arial, sans-serif',
    category: 'sans',
  },
  {
    id: 'humanist-sans',
    label: 'Humanist Sans (Trebuchet MS)',
    family: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", sans-serif',
    category: 'sans',
  },
  {
    id: 'bold-impact',
    label: 'Bold Impact Headline (Impact / Arial Black)',
    family: 'Impact, "Arial Black", -apple-system, sans-serif',
    category: 'display',
  },
  {
    id: 'classic-serif',
    label: 'Editorial Serif (Georgia / Cambria)',
    family: 'Georgia, Cambria, "Times New Roman", Times, serif',
    category: 'serif',
  },
  {
    id: 'garamond-serif',
    label: 'Classic Literary Serif (Garamond)',
    family: 'Garamond, "Baskerville", "Baskerville Old Face", "Hoefler Text", serif',
    category: 'serif',
  },
  {
    id: 'tech-mono',
    label: 'Code & Tech Mono (SF Mono / Consolas)',
    family: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    category: 'mono',
  },
  {
    id: 'courier-mono',
    label: 'Typewriter Vintage (Courier New)',
    family: '"Courier New", Courier, monospace',
    category: 'mono',
  },
];

export interface CustomFont {
  id: string;
  name: string;
  family: string;
  format: 'ttf' | 'otf' | 'woff' | 'woff2' | 'google';
  url?: string;
  dataUrl?: string;
  category?: 'sans' | 'serif' | 'mono' | 'display';
  source: 'upload' | 'google' | 'preset';
}

export const CURATED_DESIGNER_FONTS: CustomFont[] = [
  {
    id: 'syne',
    name: 'Syne',
    family: '"Syne", sans-serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap',
    category: 'display',
    source: 'google',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: '"Space Grotesk", sans-serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap',
    category: 'sans',
    source: 'google',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: '"Outfit", sans-serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&display=swap',
    category: 'sans',
    source: 'google',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: '"Playfair Display", serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&display=swap',
    category: 'serif',
    source: 'google',
  },
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    family: '"Bebas Neue", sans-serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    category: 'display',
    source: 'google',
  },
  {
    id: 'cinzel',
    name: 'Cinzel Decorative',
    family: '"Cinzel", serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&display=swap',
    category: 'serif',
    source: 'google',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: '"Plus Jakarta Sans", sans-serif',
    format: 'google',
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&display=swap',
    category: 'sans',
    source: 'google',
  },
];

export interface Custom3DModel {
  id: string;
  name: string;
  type: 'glb' | 'gltf' | 'obj' | 'preset';
  url: string; // blob URL, data URL, preset id, or relative asset path
  dataUrl?: string; // base64 encoded data url for persistence & zip bundling
  fileSize?: number;
  fileName?: string;
  autoNormalizeScale?: boolean;
  baseScaleMultiplier?: number;
  source: 'upload' | 'preset';
  description?: string;
  // Discovered GLTF Animations & Global Animation State
  animationClips?: string[]; // List of discovered GLTF animation names
  selectedAnimation?: string; // Active animation clip name
  playAnimation?: boolean; // Whether model animation is playing (default: true)
  animationSpeed?: number; // Global animation speed multiplier (0.1x to 3x)
}

export const PRESET_3D_MODELS: Custom3DModel[] = [
  {
    id: 'iphone-default',
    name: 'iPhone 15 Pro Titanium',
    type: 'preset',
    url: 'default',
    source: 'preset',
    description: 'Precision engineered flagship smartphone model with aerospace titanium body.',
  },
  {
    id: 'preset-crystal',
    name: 'Prismatic Diamond Crystal',
    type: 'preset',
    url: 'preset:crystal',
    source: 'preset',
    description: 'Reflective faceted quartz crystal sculpture with dispersion glass optics.',
  },
  {
    id: 'preset-torus',
    name: 'Cybernetic Torus Core',
    type: 'preset',
    url: 'preset:torus',
    source: 'preset',
    description: 'Futuristic geometric ring knot with metallic chassis and photon channels.',
  },
  {
    id: 'preset-core',
    name: 'Quantum Kinetic Sphere',
    type: 'preset',
    url: 'preset:core',
    source: 'preset',
    description: 'Multi-axis gyroscopic kinetic spheres with chrome and polished dark gold.',
  },
];

export interface WebsiteConfig {
  siteTitle: string;
  brandName: string;
  navLinks: Array<{ label: string; href: string }>;
  headerCtaText: string;
  headerCtaLink: string;
  environmentPreset: 'city' | 'studio' | 'sunset' | 'dawn' | 'night';
  ambientIntensity: number;
  lightIntensity: number;
  sections: SectionKeyframe[];
  // Navigation & Viewport Display Options
  mobileNavbarStyle?: 'hamburger' | 'links' | 'hidden'; // Navbar display on tablet & mobile viewport (default: 'hamburger')
  // 3D Model & Custom Font Assets
  activeModelId?: string;
  customModels?: Custom3DModel[];
  customFonts?: CustomFont[];
  // Multi-Model 3D Scene (e.g. Model 1, Model 2, Model 3...)
  sceneModels?: SceneModelItem[];
  activeEditingModelId?: string;
}

export interface ViewportMode {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  width: string;
  height: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  updatedAt: number;
  config: WebsiteConfig;
  thumbnailModelId?: string;
  description?: string;
}

export function serializeConfigToUrlParam(config?: WebsiteConfig): string {
  if (!config) return '';
  try {
    // Compact config stripping heavy base64 data URLs for URL transmission
    const compactConfig = {
      ...config,
      customModels: config.customModels?.map((m) => {
        const { dataUrl, ...rest } = m;
        return rest;
      }),
      customFonts: config.customFonts?.map((f) => {
        const { dataUrl, ...rest } = f;
        return rest;
      }),
    };
    const jsonStr = JSON.stringify(compactConfig);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (e) {
    console.error('Failed to serialize config to URL param:', e);
    return '';
  }
}

export function deserializeConfigFromUrlParam(param: string): WebsiteConfig | null {
  if (!param) return null;
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(param))));
    const parsed = JSON.parse(jsonStr) as WebsiteConfig;
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to deserialize config from URL param:', e);
  }
  return null;
}

