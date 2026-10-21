import React, { useState, useEffect, useMemo } from 'react';
import { WebsiteConfig, Custom3DModel, PRESET_3D_MODELS, getEffectiveSection } from './types/builder';
import { ScrollCanvas } from './components/ScrollCanvas';
import { ScrollPage } from './components/ScrollPage';
import { ensureAllFontsLoaded } from './utils/fontManager';

export const siteConfig: WebsiteConfig = {
  "siteTitle": "New 3D Project - Interactive 3D Experience",
  "brandName": "New 3D Project",
  "navLinks": [
    {
      "label": "Hero Intro",
      "href": "#section-0"
    },
    {
      "label": "Product Details",
      "href": "#section-1"
    },
    {
      "label": "Call to Action",
      "href": "#section-2"
    },
    {
      "label": "Specs & Tech",
      "href": "#section-3"
    },
    {
      "label": "Conclusion",
      "href": "#section-4"
    }
  ],
  "headerCtaText": "Get Started",
  "headerCtaLink": "#section-4",
  "environmentPreset": "studio",
  "ambientIntensity": 0.8,
  "lightIntensity": 1.2,
  "activeModelId": "model-1792570904245",
  "sections": [
    {
      "id": "section-0",
      "name": "Hero Intro",
      "badge": "Interactive 3D Website",
      "title": "Crafted In Motion",
      "subtitle": "Welcome to your new 3D project. Scroll to preview smooth camera angles and interactive transitions.",
      "ctaText": "Get Started",
      "ctaLink": "#section-1",
      "layout": "center",
      "theme": "midnight",
      "titleSize": 8,
      "titleColor": "#ffffff",
      "textColor": "#94a3b8",
      "titleX": 0,
      "titleY": 4,
      "modelTransform": {
        "scale": 68,
        "position": [
          0,
          -3.3,
          -0.5
        ],
        "rotation": [
          0,
          3.14,
          0
        ]
      },
      "modelTransforms": {
        "model-2": {
          "scale": 2,
          "position": [
            0,
            -0.3,
            -1.55
          ],
          "rotation": [
            0,
            4.642575810304916,
            0
          ]
        }
      },
      "modelVisibilities": {
        "model-2": true
      },
      "modelAnimations": {},
      "textAlign": "center"
    },
    {
      "id": "section-1",
      "name": "Product Details",
      "badge": "Feature Showcase",
      "title": "Every Angle Explored",
      "subtitle": "Add custom 3D models (.glb, .gltf, .obj), upload fonts, configure colors, and orchestrate animations.",
      "ctaText": "Learn More",
      "ctaLink": "#section-2",
      "layout": "left-text",
      "theme": "midnight",
      "titleSize": 6,
      "titleColor": "#38bdf8",
      "textColor": "#94a3b8",
      "titleX": 0,
      "titleY": 0,
      "modelTransform": {
        "scale": 85,
        "position": [
          1.7,
          -3,
          0
        ],
        "rotation": [
          -0.2,
          1.8,
          0.2
        ]
      },
      "specs": [
        {
          "label": "Precision",
          "value": "Real-time",
          "detail": "Instant WebGL rendering"
        },
        {
          "label": "Responsive",
          "value": "Desktop & Mobile",
          "detail": "Fluid responsive layout"
        },
        {
          "label": "Assets",
          "value": "3D & Fonts",
          "detail": "Drop-in custom uploads"
        }
      ],
      "modelTransforms": {
        "model-2": {
          "scale": 1,
          "position": [
            -0.06,
            -1.1,
            -0.15
          ],
          "rotation": [
            0.767944870877505,
            0.47123889803846897,
            -0.5934119456780721
          ]
        }
      },
      "modelVisibilities": {
        "model-2": true
      },
      "modelAnimations": {}
    },
    {
      "id": "section-2",
      "name": "Call to Action",
      "badge": "Final Showcase",
      "title": "Ready for the World",
      "subtitle": "Export clean React code or publish your interactive 3D landing page instantly.",
      "ctaText": "Launch Project",
      "ctaLink": "#section-0",
      "layout": "center",
      "theme": "midnight",
      "titleSize": 7,
      "titleColor": "#a855f7",
      "textColor": "#cbd5e1",
      "titleX": 0,
      "titleY": 0,
      "modelTransform": {
        "scale": 72,
        "position": [
          0,
          -3.4,
          -0.4
        ],
        "rotation": [
          0.25,
          -0.6,
          0.1
        ]
      },
      "modelTransforms": {
        "model-2": {
          "scale": 1,
          "position": [
            2.1778071482940147e-27,
            -1.3,
            -0.55
          ],
          "rotation": [
            -0.017453292519943295,
            0.5410520681182421,
            1.5882496193148399
          ]
        }
      },
      "modelVisibilities": {
        "model-2": true
      },
      "modelAnimations": {}
    },
    {
      "id": "section-3",
      "name": "Specs & Tech",
      "badge": "Technical Architecture",
      "title": "Engineered for Performance",
      "subtitle": "Ultra-fast frame rates powered by Three.js and hardware-accelerated shaders.",
      "ctaText": "View Architecture",
      "ctaLink": "#section-0",
      "layout": "right-text",
      "theme": "midnight",
      "titleSize": 6,
      "titleColor": "#34d399",
      "textColor": "#94a3b8",
      "titleX": 0,
      "titleY": 0,
      "modelTransform": {
        "scale": 90,
        "position": [
          -1.6,
          -3.1,
          0.1
        ],
        "rotation": [
          -0.3,
          -1.2,
          0.1
        ]
      },
      "modelTransforms": {
        "model-2": {
          "scale": 79,
          "position": [
            0.3999999999999999,
            -3.1,
            -0.5499999999999999
          ],
          "rotation": [
            -0.3,
            -1.65,
            0.1
          ]
        }
      },
      "modelVisibilities": {
        "model-2": true
      },
      "modelAnimations": {}
    },
    {
      "id": "section-4",
      "name": "Conclusion",
      "badge": "Join The Evolution",
      "title": "Build the Future",
      "subtitle": "Connect with our team to explore tailored implementations and custom integrations.",
      "ctaText": "Get in Touch",
      "ctaLink": "#section-0",
      "layout": "center",
      "theme": "midnight",
      "titleSize": 7,
      "titleColor": "#38bdf8",
      "textColor": "#94a3b8",
      "titleX": 0,
      "titleY": 0,
      "modelTransform": {
        "scale": 70,
        "position": [
          0,
          -3.3,
          -0.5
        ],
        "rotation": [
          0,
          3.14,
          0
        ]
      },
      "modelTransforms": {
        "model-2": {
          "scale": 62,
          "position": [
            2,
            -3.3,
            -0.6499999999999999
          ],
          "rotation": [
            0,
            3.5900000000000003,
            0
          ]
        }
      },
      "modelVisibilities": {
        "model-2": true
      },
      "modelAnimations": {}
    }
  ],
  "sceneModels": [
    {
      "id": "model-2",
      "name": "Model 2",
      "modelAssetId": "model-1792570904245",
      "colorTag": "#a855f7"
    }
  ],
  "activeEditingModelId": "model-2",
  "customModels": [
    {
      "id": "model-1792570904245",
      "name": "apple_watch_series_7_-_free_watch-face_sdctm",
      "fileName": "apple_watch_series_7_-_free_watch-face_sdctm.glb",
      "type": "glb",
      "url": "/models/apple_watch_series_7_-_free_watch-face_sdctm.glb",
      "fileSize": 8119492,
      "autoNormalizeScale": true,
      "source": "upload",
      "description": "Uploaded apple_watch_series_7_-_free_watch-face_sdctm.glb (7.74 MB)"
    }
  ]
};

function getSectionThemeBgColor(theme?: string): string {
  switch (theme) {
    case 'titanium':
      return '#1c1917';
    case 'midnight':
      return '#020617';
    case 'oled':
      return '#000000';
    case 'light':
      return '#f5f5f5';
    default:
      return '#0a0a0a';
  }
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeViewport, setActiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Load custom fonts if configured
  useEffect(() => {
    if (siteConfig.customFonts && siteConfig.customFonts.length > 0) {
      ensureAllFontsLoaded(siteConfig.customFonts);
    }
  }, []);

  // Track window viewport dimensions for responsive 3D transforms
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setActiveViewport('mobile');
      else if (w < 1024) setActiveViewport('tablet');
      else setActiveViewport('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allModels = useMemo(() => {
    return [...PRESET_3D_MODELS, ...(siteConfig.customModels || [])];
  }, []);

  const activeModel = useMemo(() => {
    return (
      allModels.find((m) => m.id === (siteConfig.activeModelId || 'iphone-default')) ||
      PRESET_3D_MODELS[0]
    );
  }, [allModels]);

  const effectiveSections = useMemo(() => {
    return siteConfig.sections.map((sec) => getEffectiveSection(sec, activeViewport));
  }, [activeViewport]);

  const effectiveConfig = useMemo(() => {
    return { ...siteConfig, sections: effectiveSections };
  }, [effectiveSections]);

  const activeSection = effectiveSections[activeSectionIndex] || effectiveSections[0];
  const isTextBack = activeSection?.textLayerOrder === 'back';
  const currentBgColor = activeSection?.backgroundColor || getSectionThemeBgColor(activeSection?.theme);

  return (
    <div className="w-screen h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden font-sans select-none">
      <div
        className="flex-1 min-h-0 relative w-full h-full overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: currentBgColor }}
      >
        {/* Fixed 3D WebGL Canvas Layer */}
        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-300 ${
            isTextBack ? 'z-20' : 'z-10'
          }`}
        >
          <ScrollCanvas
            sections={effectiveSections}
            scrollProgress={scrollProgress}
            isEditMode={false}
            sceneModels={siteConfig.sceneModels}
            activeModel={activeModel}
            allModels={allModels}
            environmentPreset={siteConfig.environmentPreset}
            ambientIntensity={siteConfig.ambientIntensity}
            lightIntensity={siteConfig.lightIntensity}
          />
        </div>

        {/* Interactive Scrollable Page Overlay */}
        <div
          className={`relative w-full h-full pointer-events-auto ${
            isTextBack ? 'z-10' : 'z-20'
          }`}
        >
          <ScrollPage
            config={effectiveConfig}
            onScrollProgress={setScrollProgress}
            activeSectionIndex={activeSectionIndex}
            onActiveSectionChange={setActiveSectionIndex}
          />
        </div>
      </div>
    </div>
  );
}
