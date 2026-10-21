import { CustomFont } from '../types/builder';

/**
 * Injects a Google Font or remote webfont stylesheet into document.head
 */
export function injectFontStylesheet(url: string, id: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById(`font-link-${id}`)) {
      resolve(true);
      return;
    }

    const link = document.createElement('link');
    link.id = `font-link-${id}`;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve(true);
    link.onerror = () => {
      console.warn(`Failed to load font stylesheet: ${url}`);
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

/**
 * Loads a user-uploaded font file (.woff2, .woff, .ttf, .otf) into the browser FontFace set
 */
export async function loadFontFromFile(file: File): Promise<CustomFont> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'ttf';
  const format: 'ttf' | 'otf' | 'woff' | 'woff2' =
    ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'otf' ? 'otf' : 'ttf';

  // Clean name for display & CSS font-family
  const cleanName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, ' ')
    .trim();
  const familyName = `Custom_${cleanName.replace(/\s+/g, '_')}_${Date.now()}`;
  const fontCssFamily = `"${familyName}", sans-serif`;

  const arrayBuffer = await file.arrayBuffer();
  const fontFace = new FontFace(familyName, arrayBuffer);

  try {
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
  } catch (err) {
    console.error('Error loading font with FontFace API:', err);
    throw new Error(`Browser failed to parse font file: ${file.name}`);
  }

  const blobUrl = URL.createObjectURL(file);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    id: `font-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    family: fontCssFamily,
    format,
    url: blobUrl,
    dataUrl,
    category: 'sans',
    source: 'upload',
  };
}

/**
 * Re-registers or activates a CustomFont instance in the browser
 */
export async function activateFont(font: CustomFont): Promise<boolean> {
  if (!font) return false;

  // Google Font Stylesheet injection
  if (font.source === 'google' && font.url) {
    return injectFontStylesheet(font.url, font.id);
  }

  // Uploaded Custom Font (dataUrl or URL)
  const cleanFamily = (font.family || font.name || 'CustomFont')
    .replace(/^"|"$/g, '')
    .split(',')[0]
    .trim();

  const fontStyleId = `font-style-${font.id || cleanFamily.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // Check if @font-face style tag already exists
  if (typeof document !== 'undefined' && document.getElementById(fontStyleId)) {
    return true;
  }

  const fontSource = font.dataUrl || font.url;
  const formatHint =
    font.format === 'woff2'
      ? " format('woff2')"
      : font.format === 'woff'
      ? " format('woff')"
      : font.format === 'ttf'
      ? " format('truetype')"
      : font.format === 'otf'
      ? " format('opentype')"
      : '';

  if (fontSource && typeof document !== 'undefined') {
    try {
      // 1. Inject @font-face CSS style block directly into <head> for instant rendering
      const styleEl = document.createElement('style');
      styleEl.id = fontStyleId;
      styleEl.textContent = `@font-face {
  font-family: "${cleanFamily}";
  src: url("${fontSource}")${formatHint};
  font-display: swap;
}`;
      document.head.appendChild(styleEl);

      // 2. Also register in document.fonts using FontFace API
      if (typeof FontFace !== 'undefined') {
        const fontFace = new FontFace(cleanFamily, `url("${fontSource}")`);
        fontFace
          .load()
          .then((loaded) => {
            document.fonts.add(loaded);
          })
          .catch((err) => {
            console.warn(`FontFace load fallback for ${cleanFamily}:`, err);
          });
      }

      return true;
    } catch (err) {
      console.warn(`Failed to inject @font-face for font ${font.name}:`, err);
    }
  }

  // Fallback: try fetching blob URL if available
  if (font.url && typeof document !== 'undefined') {
    try {
      const response = await fetch(font.url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const fontFace = new FontFace(cleanFamily, buffer);
        const loaded = await fontFace.load();
        document.fonts.add(loaded);
        return true;
      }
    } catch (e) {
      console.warn(`Could not reload uploaded font URL ${font.name}:`, e);
    }
  }

  return false;
}

/**
 * Re-registers all custom fonts in the document
 */
export async function ensureAllFontsLoaded(fonts: CustomFont[] = []): Promise<void> {
  if (!Array.isArray(fonts) || fonts.length === 0) return;
  await Promise.allSettled(fonts.map((f) => activateFont(f)));
}
