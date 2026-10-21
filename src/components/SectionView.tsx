import React, { useState, useEffect } from 'react';
import { SectionKeyframe, SectionLayout } from '../types/builder';
import { ChevronDown, ArrowUpRight, Sparkles, Type, X, Check, Trash2, Pencil, Plus, Magnet, Grid, Move, Compass, Lock } from 'lucide-react';

export function getTitleFontSize(size?: number, layout: SectionLayout = 'center'): string {
  const baseSize = size || (layout === 'center' ? 8 : 5.5);
  return `clamp(1.85rem, ${baseSize * 0.85}vw, 5rem)`;
}

export function getSectionThemeClass(theme: string): string {
  switch (theme) {
    case 'titanium':
      return 'text-stone-100';
    case 'midnight':
      return 'text-white';
    case 'oled':
      return 'text-white';
    case 'light':
      return 'text-neutral-900';
    default:
      return 'text-white';
  }
}

export function getSectionThemeBgColor(theme?: string): string {
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

const SNAP_GRID_X = [
  { value: -35, label: 'Far Left (-35%)' },
  { value: -25, label: 'Left Column (-25%)' },
  { value: 0, label: 'Center Axis (0%)' },
  { value: 25, label: 'Right Column (+25%)' },
  { value: 35, label: 'Far Right (+35%)' },
];

const SNAP_GRID_Y = [
  { value: -30, label: 'Top Margin (-30%)' },
  { value: -20, label: 'Upper Axis (-20%)' },
  { value: 0, label: 'Center Axis (0%)' },
  { value: 20, label: 'Lower Axis (+20%)' },
  { value: 30, label: 'Bottom Margin (+30%)' },
];

const SNAP_THRESHOLD = 3.5;

interface SectionViewProps {
  section: SectionKeyframe;
  sectionIndex: number;
  totalSections: number;
  isStudioPreview?: boolean;
  onScrollToNext?: () => void;
  onContextMenu?: (e: React.MouseEvent, targetType: 'text' | '3d') => void;
  onUpdateSection?: (updated: Partial<SectionKeyframe>) => void;
}

export function SectionView({
  section,
  sectionIndex,
  totalSections,
  isStudioPreview = false,
  onScrollToNext,
  onContextMenu,
  onUpdateSection,
}: SectionViewProps) {
  const [editingField, setEditingField] = useState<'title' | 'subtitle' | 'badge' | 'ctaText' | string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number; initialX: number; initialY: number } | null>(null);
  const [activeSnapLines, setActiveSnapLines] = useState<{ x?: number; xLabel?: string; y?: number; yLabel?: string } | null>(null);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [magnetSnapEnabled, setMagnetSnapEnabled] = useState(true);

  const isTextBack = section.textLayerOrder === 'back';
  const zIndexVal = isTextBack ? 0 : 20;
  const isHero = sectionIndex === 0;

  // Magnetic Snapping Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isStudioPreview || !onUpdateSection) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    setIsDragging(true);
    setDragStartPos({
      x: e.clientX,
      y: e.clientY,
      initialX: section.titleX ?? 0,
      initialY: section.titleY ?? 0,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartPos || !onUpdateSection) return;

    const deltaXPixels = e.clientX - dragStartPos.x;
    const deltaYPixels = e.clientY - dragStartPos.y;

    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    const deltaXUnits = deltaXPixels / (vw * 0.0075);
    const deltaYUnits = deltaYPixels / (vh * 0.0075);

    let rawX = Math.round(dragStartPos.initialX + deltaXUnits);
    let rawY = Math.round(dragStartPos.initialY + deltaYUnits);

    rawX = Math.min(50, Math.max(-50, rawX));
    rawY = Math.min(50, Math.max(-50, rawY));

    let targetX = rawX;
    let targetY = rawY;
    let snappedX: number | undefined;
    let snappedXLabel: string | undefined;
    let snappedY: number | undefined;
    let snappedYLabel: string | undefined;

    if (magnetSnapEnabled) {
      for (const gridLine of SNAP_GRID_X) {
        if (Math.abs(rawX - gridLine.value) <= SNAP_THRESHOLD) {
          targetX = gridLine.value;
          snappedX = gridLine.value;
          snappedXLabel = gridLine.label;
          break;
        }
      }

      for (const gridLine of SNAP_GRID_Y) {
        if (Math.abs(rawY - gridLine.value) <= SNAP_THRESHOLD) {
          targetY = gridLine.value;
          snappedY = gridLine.value;
          snappedYLabel = gridLine.label;
          break;
        }
      }
    }

    if (snappedX !== undefined || snappedY !== undefined) {
      setActiveSnapLines({ x: snappedX, xLabel: snappedXLabel, y: snappedY, yLabel: snappedYLabel });
    } else {
      setActiveSnapLines(null);
    }

    let newAlign = section.textAlign;
    let newLayout = section.layout;
    if (targetX === 0) {
      newAlign = 'center';
      if (newLayout === 'left-text' || newLayout === 'right-text') newLayout = 'center';
    } else if (targetX <= -20) {
      newAlign = 'left';
      newLayout = 'left-text';
    } else if (targetX >= 20) {
      newAlign = 'right';
      newLayout = 'right-text';
    }

    onUpdateSection({
      titleX: targetX,
      titleY: targetY,
      textAlign: newAlign,
      layout: newLayout,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      setIsDragging(false);
      setDragStartPos(null);
      setTimeout(() => setActiveSnapLines(null), 1200);
    }
  };

  // Handle Double Click to open inline/floating editor
  const handleDoubleClick = (e: React.MouseEvent, field: string) => {
    if (!isStudioPreview) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedField(field);
    setEditingField(field);
  };

  // Handle Single Click for selection
  const handleSelectField = (e: React.MouseEvent, field: string) => {
    if (!isStudioPreview) return;
    e.stopPropagation();
    setSelectedField(field);
  };

  // Delete element handler
  const handleDeleteElement = (field: string) => {
    if (!onUpdateSection) return;
    if (field === 'badge') {
      onUpdateSection({ badge: '' });
    } else if (field === 'title') {
      onUpdateSection({ title: '' });
    } else if (field === 'subtitle') {
      onUpdateSection({ subtitle: '' });
    } else if (field === 'ctaText') {
      onUpdateSection({ ctaText: '' });
    } else if (field.startsWith('spec-')) {
      const specIdx = parseInt(field.split('-')[1], 10);
      const updatedSpecs = (section.specs || []).filter((_, idx) => idx !== specIdx);
      onUpdateSection({ specs: updatedSpecs });
    }
    setSelectedField(null);
    setEditingField(null);
  };

  // Keyboard Delete & Backspace listener for selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStudioPreview || !selectedField) return;

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteElement(selectedField);
      } else if (e.key === 'Escape') {
        setSelectedField(null);
        setEditingField(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudioPreview, selectedField, section, onUpdateSection]);

  // Floating Action Bar overlay on active selected element
  const renderSelectionOverlay = (field: string, label: string) => {
    if (!isStudioPreview || selectedField !== field) return null;
    return (
      <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 border border-sky-500/90 text-white rounded-full px-3 py-1 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in zoom-in-95 backdrop-blur-md pointer-events-auto shrink-0 select-none">
        <span className="text-sky-400 text-[10px] uppercase tracking-wider font-mono font-bold">{label}</span>
        <div className="w-px h-3 bg-neutral-700" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditingField(field);
          }}
          className="p-1 hover:bg-neutral-800 rounded-full text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
          title="Edit Size, Width & Text"
        >
          <Pencil className="w-3 h-3 text-sky-400" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteElement(field);
          }}
          className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full transition cursor-pointer flex items-center gap-1 text-[11px]"
          title="Delete this element (Del / Backspace)"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 relative transition-colors duration-500 pointer-events-auto ${
        getSectionThemeClass(section.theme)
      }`}
      onClick={() => isStudioPreview && setSelectedField(null)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, '3d')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Studio Magnetic Snap HUD & Guidelines Overlay */}
      {isStudioPreview && (
        <>
          {/* Top Canvas HUD Toolbar */}
          <div className="absolute top-3 right-3 z-40 flex items-center gap-2 select-none pointer-events-auto">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold text-white">
              {/* Magnetic Snap Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMagnetSnapEnabled(!magnetSnapEnabled);
                }}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  magnetSnapEnabled
                    ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title={magnetSnapEnabled ? 'Magnetic Snapping: ACTIVE' : 'Enable Magnetic Snapping Grid'}
              >
                <Magnet className={`w-3.5 h-3.5 ${magnetSnapEnabled ? 'text-white animate-pulse' : ''}`} />
                <span>Magnetic Snap</span>
              </button>

              {/* Grid Guidelines Overlay Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGridOverlay(!showGridOverlay);
                }}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  showGridOverlay
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
                title="Toggle underlying grid guidelines overlay"
              >
                <Grid className="w-3.5 h-3.5 text-sky-400" />
                <span>Grid Lines</span>
              </button>

              {/* Coordinate / Snap Status Readout */}
              <div className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-[10px] text-sky-300 font-bold flex items-center gap-1.5 min-w-[120px] justify-center">
                {activeSnapLines ? (
                  <span className="text-amber-300 flex items-center gap-1 animate-pulse">
                    <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>
                      {activeSnapLines.xLabel || ''} {activeSnapLines.yLabel || ''}
                    </span>
                  </span>
                ) : (
                  <span>
                    X: {section.titleX ?? 0}% · Y: {section.titleY ?? 0}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Underlying Laser Guidelines Grid Overlay */}
          {(showGridOverlay || isDragging || activeSnapLines) && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
              {/* Vertical Guidelines (X Axes) */}
              {SNAP_GRID_X.map((line) => {
                const isSnapped = activeSnapLines?.x === line.value;
                const leftPercent = 50 + line.value;
                return (
                  <div
                    key={line.value}
                    className={`absolute top-0 bottom-0 transition-all duration-150 ${
                      isSnapped
                        ? 'border-l-2 border-[#2563EB] shadow-[0_0_16px_#2563eb] z-20'
                        : showGridOverlay
                        ? 'border-l border-dashed border-sky-400/30'
                        : 'hidden'
                    }`}
                    style={{ left: `${leftPercent}%` }}
                  >
                    {(isSnapped || showGridOverlay) && (
                      <div
                        className={`absolute top-2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md ${
                          isSnapped
                            ? 'bg-[#2563EB] text-white ring-2 ring-blue-300 shadow-xl scale-105'
                            : 'bg-neutral-900/90 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {line.label}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Horizontal Guidelines (Y Axes) */}
              {SNAP_GRID_Y.map((line) => {
                const isSnapped = activeSnapLines?.y === line.value;
                const topPercent = 50 + line.value;
                return (
                  <div
                    key={line.value}
                    className={`absolute left-0 right-0 transition-all duration-150 ${
                      isSnapped
                        ? 'border-t-2 border-[#2563EB] shadow-[0_0_16px_#2563eb] z-20'
                        : showGridOverlay
                        ? 'border-t border-dashed border-sky-400/30'
                        : 'hidden'
                    }`}
                    style={{ top: `${topPercent}%` }}
                  >
                    {(isSnapped || showGridOverlay) && (
                      <div
                        className={`absolute left-2 -translate-y-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md ${
                          isSnapped
                            ? 'bg-[#2563EB] text-white ring-2 ring-blue-300 shadow-xl scale-105'
                            : 'bg-neutral-900/90 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {line.label}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Snapped Crosshair Anchor Pulse */}
              {activeSnapLines && activeSnapLines.x !== undefined && activeSnapLines.y !== undefined && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_24px_#f59e0b] animate-ping z-40 pointer-events-none"
                  style={{
                    left: `${50 + activeSnapLines.x}%`,
                    top: `${50 + activeSnapLines.y}%`,
                  }}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Floating Text Inspector Modal when an element is double clicked */}
      {isStudioPreview && editingField && onUpdateSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setEditingField(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-5 text-white space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm">
                  {editingField === 'title' && 'Edit Main Title'}
                  {editingField === 'subtitle' && 'Edit Subtitle / Story'}
                  {editingField === 'badge' && 'Edit Badge Tagline'}
                  {editingField === 'ctaText' && 'Edit Call-To-Action Button'}
                  {editingField.startsWith('spec-') && 'Edit Spec Feature Item'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDeleteElement(editingField)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Delete this component"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Field Specific Inputs */}
            {/* 1. MAIN TITLE EDITOR */}
            {editingField === 'title' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Title Text</label>
                  <textarea
                    rows={2}
                    value={section.title}
                    onChange={(e) => onUpdateSection({ title: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-semibold"
                    placeholder="Enter main title..."
                    autoFocus
                  />
                </div>

                {/* Font Size (vw/rem) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Font Size (Scale)</span>
                    <span className="font-mono text-sky-400 font-bold">{section.titleSize || 8}vw</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={16}
                    step={0.5}
                    value={section.titleSize || 8}
                    onChange={(e) => onUpdateSection({ titleSize: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Container Max Width (%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Box Max-Width (Width)</span>
                    <span className="font-mono text-sky-400 font-bold">{section.titleMaxWidth || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={section.titleMaxWidth || 100}
                    onChange={(e) => onUpdateSection({ titleMaxWidth: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Line Height (Height / Spacing) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Line Height (Box Height & Spacing)</span>
                    <span className="font-mono text-sky-400 font-bold">{(section.titleLineHeight || 1.1).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.85}
                    max={2.0}
                    step={0.05}
                    value={section.titleLineHeight || 1.1}
                    onChange={(e) => onUpdateSection({ titleLineHeight: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400">Title Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={section.titleColor || '#ffffff'}
                      onChange={(e) => onUpdateSection({ titleColor: e.target.value })}
                      className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={section.titleColor || '#ffffff'}
                      onChange={(e) => onUpdateSection({ titleColor: e.target.value })}
                      className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUBTITLE / STORY EDITOR */}
            {editingField === 'subtitle' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Subtitle Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={section.subtitle}
                    onChange={(e) => onUpdateSection({ subtitle: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="Enter subtitle text..."
                    autoFocus
                  />
                </div>

                {/* Subtitle Font Size (rem) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Font Size (Scale)</span>
                    <span className="font-mono text-sky-400 font-bold">{(section.subtitleSize || 1.0).toFixed(1)}rem</span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={2.5}
                    step={0.1}
                    value={section.subtitleSize || 1.0}
                    onChange={(e) => onUpdateSection({ subtitleSize: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Subtitle Container Max Width (%) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Box Max-Width (Width)</span>
                    <span className="font-mono text-sky-400 font-bold">{section.subtitleMaxWidth || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={section.subtitleMaxWidth || 100}
                    onChange={(e) => onUpdateSection({ subtitleMaxWidth: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Subtitle Line Height */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Line Height (Box Height)</span>
                    <span className="font-mono text-sky-400 font-bold">{(section.subtitleLineHeight || 1.6).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.4}
                    step={0.05}
                    value={section.subtitleLineHeight || 1.6}
                    onChange={(e) => onUpdateSection({ subtitleLineHeight: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400">Subtitle Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={section.textColor || '#d4d4d8'}
                      onChange={(e) => onUpdateSection({ textColor: e.target.value })}
                      className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={section.textColor || '#d4d4d8'}
                      onChange={(e) => onUpdateSection({ textColor: e.target.value })}
                      className="w-20 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. BADGE TAGLINE EDITOR */}
            {editingField === 'badge' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Badge Tagline</label>
                  <input
                    type="text"
                    value={section.badge}
                    onChange={(e) => onUpdateSection({ badge: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-semibold"
                    placeholder="Enter badge tagline..."
                    autoFocus
                  />
                </div>

                {/* Badge Size */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Badge Font Size</span>
                    <span className="font-mono text-sky-400 font-bold">{(section.badgeSize || 0.75).toFixed(2)}rem</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    value={section.badgeSize || 0.75}
                    onChange={(e) => onUpdateSection({ badgeSize: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. CTA BUTTON EDITOR */}
            {editingField === 'ctaText' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Call-To-Action Button Text</label>
                  <input
                    type="text"
                    value={section.ctaText || ''}
                    onChange={(e) => onUpdateSection({ ctaText: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-semibold"
                    placeholder="Enter button text..."
                    autoFocus
                  />
                </div>

                {/* CTA Size */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Button Font Size</span>
                    <span className="font-mono text-sky-400 font-bold">{(section.ctaSize || 0.875).toFixed(2)}rem</span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={1.8}
                    step={0.05}
                    value={section.ctaSize || 0.875}
                    onChange={(e) => onUpdateSection({ ctaSize: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 5. SPEC ITEM EDITOR */}
            {editingField.startsWith('spec-') && (
              <div className="space-y-3">
                {(() => {
                  const specIdx = parseInt(editingField.split('-')[1], 10);
                  const spec = section.specs?.[specIdx];
                  if (!spec) return null;

                  return (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">Spec Headline Value</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...(section.specs || [])];
                            newSpecs[specIdx] = { ...spec, value: e.target.value };
                            onUpdateSection({ specs: newSpecs });
                          }}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-bold focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">Spec Category Label</label>
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => {
                            const newSpecs = [...(section.specs || [])];
                            newSpecs[specIdx] = { ...spec, label: e.target.value };
                            onUpdateSection({ specs: newSpecs });
                          }}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Done Footer */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">Press Esc or click Done</span>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Layout: Center / Hero */}
        {section.layout === 'center' && (
          <div
            className={`text-center flex flex-col items-center justify-center max-w-3xl mx-auto cursor-context-menu relative ${
              isStudioPreview ? 'touch-none select-none group' : ''
            }`}
            style={{
              position: 'relative',
              zIndex: zIndexVal,
              transform: `translate(calc(${section.titleX ?? 0} * 0.75vw), calc(${section.titleY ?? 0} * 0.75vh))`,
            }}
            onPointerDown={handlePointerDown}
            onContextMenu={(e) => {
              e.stopPropagation();
              onContextMenu && onContextMenu(e, 'text');
            }}
            title={isStudioPreview ? "Drag to position with Magnetic Snap / Right-click for options" : undefined}
          >
            {isStudioPreview && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing px-2.5 py-0.5 rounded-full bg-[#2563EB]/90 hover:bg-[#2563EB] text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg backdrop-blur-md z-40 transition-opacity opacity-80 group-hover:opacity-100">
                <Move className="w-3 h-3 text-sky-300" />
                <span>Drag & Magnetic Snap</span>
              </div>
            )}

            {/* Badge Tagline */}
            {section.badge && (
              <div
                onClick={(e) => handleSelectField(e, 'badge')}
                onDoubleClick={(e) => handleDoubleClick(e, 'badge')}
                className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full uppercase bg-black/60 text-neutral-200 border border-white/20 mb-4 shadow-sm transition-all ${
                  isStudioPreview
                    ? `cursor-pointer ${
                        selectedField === 'badge'
                          ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-lg scale-105'
                          : 'hover:ring-2 hover:ring-sky-400/80'
                      }`
                    : ''
                }`}
                style={{ fontSize: section.badgeSize ? `${section.badgeSize}rem` : '0.7rem' }}
                title={isStudioPreview ? 'Click to select / double-click to edit badge' : undefined}
              >
                {renderSelectionOverlay('badge', 'Badge Tagline')}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{section.badge}</span>
              </div>
            )}

            {/* Main Title */}
            {section.title && (
              <div className="relative inline-block max-w-full">
                {renderSelectionOverlay('title', 'Main Title')}
                <h1
                  onClick={(e) => handleSelectField(e, 'title')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                  className={`font-black tracking-tighter mb-4 select-none transition-all ${
                    isStudioPreview
                      ? `cursor-pointer rounded-lg px-2 ${
                          selectedField === 'title'
                            ? 'ring-2 ring-sky-400 ring-offset-4 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{
                    fontSize: getTitleFontSize(section.titleSize, 'center'),
                    color: section.titleColor || '#ffffff',
                    fontFamily: section.titleFontFamily || 'inherit',
                    textAlign: section.textAlign || undefined,
                    maxWidth: section.titleMaxWidth ? `${section.titleMaxWidth}%` : '100%',
                    lineHeight: section.titleLineHeight || 1.1,
                  }}
                  title={isStudioPreview ? 'Click to select / double-click to edit title' : undefined}
                >
                  {section.title}
                </h1>
              </div>
            )}

            {/* Subtitle / Story Paragraph */}
            {section.subtitle && (
              <div className="relative inline-block max-w-full">
                {renderSelectionOverlay('subtitle', 'Subtitle / Story')}
                <p
                  onClick={(e) => handleSelectField(e, 'subtitle')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'subtitle')}
                  className={`font-normal leading-relaxed mb-6 opacity-95 transition-all ${
                    isStudioPreview
                      ? `cursor-pointer rounded-lg px-2 ${
                          selectedField === 'subtitle'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{
                    color: section.textColor || '#d4d4d8',
                    fontFamily: section.subtitleFontFamily || 'inherit',
                    textAlign: section.textAlign || undefined,
                    fontSize: section.subtitleSize ? `${section.subtitleSize}rem` : undefined,
                    maxWidth: section.subtitleMaxWidth ? `${section.subtitleMaxWidth}%` : '36rem',
                    lineHeight: section.subtitleLineHeight || 1.6,
                  }}
                  title={isStudioPreview ? 'Click to select / double-click to edit subtitle' : undefined}
                >
                  {section.subtitle}
                </p>
              </div>
            )}

            {/* Spec Badges Grid */}
            {section.specs && section.specs.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 my-4">
                {section.specs.map((spec, sIdx) => {
                  const fieldKey = `spec-${sIdx}`;
                  return (
                    <div
                      key={sIdx}
                      onClick={(e) => handleSelectField(e, fieldKey)}
                      onDoubleClick={(e) => handleDoubleClick(e, fieldKey)}
                      className={`relative px-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white shadow-lg text-center min-w-[100px] transition-all ${
                        isStudioPreview
                          ? `cursor-pointer ${
                              selectedField === fieldKey
                                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/40 shadow-xl scale-105'
                                : 'hover:ring-2 hover:ring-sky-400/80'
                            }`
                          : ''
                      }`}
                      title={isStudioPreview ? 'Click to select / double-click to edit spec' : undefined}
                    >
                      {renderSelectionOverlay(fieldKey, `Spec Item #${sIdx + 1}`)}
                      <div className="text-lg font-bold tracking-tight text-white">{spec.value}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {spec.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Button */}
            {section.ctaText && (
              <div className="relative inline-flex items-center justify-center gap-4 mt-2">
                {renderSelectionOverlay('ctaText', 'CTA Button')}
                <button
                  type="button"
                  onClick={(e) => {
                    if (isStudioPreview) {
                      handleSelectField(e, 'ctaText');
                    } else {
                      onScrollToNext?.();
                    }
                  }}
                  onDoubleClick={(e) => handleDoubleClick(e, 'ctaText')}
                  className={`px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                    isStudioPreview
                      ? `${
                          selectedField === 'ctaText'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-2xl scale-105'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{ fontSize: section.ctaSize ? `${section.ctaSize}rem` : '0.875rem' }}
                  title={isStudioPreview ? 'Click to select / double-click to edit CTA button' : undefined}
                >
                  <span>{section.ctaText}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Layout: Left Text (3D Model on Right) */}
        {section.layout === 'left-text' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div
              className={`lg:col-span-6 flex flex-col justify-center cursor-context-menu relative ${
                isStudioPreview ? 'touch-none select-none group' : ''
              }`}
              style={{
                position: 'relative',
                zIndex: zIndexVal,
                transform: `translate(calc(${section.titleX ?? 0} * 0.75vw), calc(${section.titleY ?? 0} * 0.75vh))`,
              }}
              onPointerDown={handlePointerDown}
              onContextMenu={(e) => {
                e.stopPropagation();
                onContextMenu && onContextMenu(e, 'text');
              }}
              title={isStudioPreview ? "Drag to position with Magnetic Snap / Right-click for options" : undefined}
            >
              {isStudioPreview && (
                <div className="absolute -top-7 left-0 cursor-grab active:cursor-grabbing px-2.5 py-0.5 rounded-full bg-[#2563EB]/90 hover:bg-[#2563EB] text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg backdrop-blur-md z-40 transition-opacity opacity-80 group-hover:opacity-100">
                  <Move className="w-3 h-3 text-sky-300" />
                  <span>Drag & Magnetic Snap</span>
                </div>
              )}
              {section.badge && (
                <div
                  onClick={(e) => handleSelectField(e, 'badge')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'badge')}
                  className={`relative self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full uppercase bg-black/60 text-neutral-200 border border-white/20 mb-3 shadow-sm transition-all ${
                    isStudioPreview
                      ? `cursor-pointer ${
                          selectedField === 'badge'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-lg scale-105'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{ fontSize: section.badgeSize ? `${section.badgeSize}rem` : '0.7rem' }}
                  title={isStudioPreview ? 'Click to select / double-click to edit badge' : undefined}
                >
                  {renderSelectionOverlay('badge', 'Badge Tagline')}
                  <span>{section.badge}</span>
                </div>
              )}

              {section.title && (
                <div className="relative inline-block max-w-full">
                  {renderSelectionOverlay('title', 'Main Title')}
                  <h2
                    onClick={(e) => handleSelectField(e, 'title')}
                    onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                    className={`font-black tracking-tight mb-3 select-none transition-all ${
                      isStudioPreview
                        ? `cursor-pointer rounded-lg px-2 ${
                            selectedField === 'title'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{
                      fontSize: getTitleFontSize(section.titleSize, 'left-text'),
                      color: section.titleColor || '#ffffff',
                      fontFamily: section.titleFontFamily || 'inherit',
                      textAlign: section.textAlign || undefined,
                      maxWidth: section.titleMaxWidth ? `${section.titleMaxWidth}%` : '100%',
                      lineHeight: section.titleLineHeight || 1.1,
                    }}
                    title={isStudioPreview ? 'Click to select / double-click to edit title' : undefined}
                  >
                    {section.title}
                  </h2>
                </div>
              )}

              {section.subtitle && (
                <div className="relative inline-block max-w-full">
                  {renderSelectionOverlay('subtitle', 'Subtitle / Story')}
                  <p
                    onClick={(e) => handleSelectField(e, 'subtitle')}
                    onDoubleClick={(e) => handleDoubleClick(e, 'subtitle')}
                    className={`leading-relaxed mb-4 opacity-95 transition-all ${
                      isStudioPreview
                        ? `cursor-pointer rounded-lg px-2 ${
                            selectedField === 'subtitle'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{
                      color: section.textColor || '#d4d4d8',
                      fontFamily: section.subtitleFontFamily || 'inherit',
                      textAlign: section.textAlign || undefined,
                      fontSize: section.subtitleSize ? `${section.subtitleSize}rem` : undefined,
                      maxWidth: section.subtitleMaxWidth ? `${section.subtitleMaxWidth}%` : '32rem',
                      lineHeight: section.subtitleLineHeight || 1.6,
                    }}
                    title={isStudioPreview ? 'Click to select / double-click to edit subtitle' : undefined}
                  >
                    {section.subtitle}
                  </p>
                </div>
              )}

              {/* Spec Badges Grid */}
              {section.specs && section.specs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
                  {section.specs.map((spec, sIdx) => {
                    const fieldKey = `spec-${sIdx}`;
                    return (
                      <div
                        key={sIdx}
                        onClick={(e) => handleSelectField(e, fieldKey)}
                        onDoubleClick={(e) => handleDoubleClick(e, fieldKey)}
                        className={`relative p-3 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white shadow-lg transition-all ${
                          isStudioPreview
                            ? `cursor-pointer ${
                                selectedField === fieldKey
                                  ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/40 shadow-xl scale-105'
                                  : 'hover:ring-2 hover:ring-sky-400/80'
                              }`
                            : ''
                        }`}
                        title={isStudioPreview ? 'Click to select / double-click to edit spec' : undefined}
                      >
                        {renderSelectionOverlay(fieldKey, `Spec Item #${sIdx + 1}`)}
                        <div className="text-base sm:text-lg font-bold tracking-tight text-white">{spec.value}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          {spec.label}
                        </div>
                        {spec.detail && (
                          <div className="text-[9px] text-neutral-400 mt-0.5 truncate">
                            {spec.detail}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {section.ctaText && (
                <div className="relative inline-flex mt-2">
                  {renderSelectionOverlay('ctaText', 'CTA Button')}
                  <button
                    type="button"
                    onClick={(e) => {
                      if (isStudioPreview) {
                        handleSelectField(e, 'ctaText');
                      } else {
                        onScrollToNext?.();
                      }
                    }}
                    onDoubleClick={(e) => handleDoubleClick(e, 'ctaText')}
                    className={`px-4 py-2 rounded-full bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer self-start ${
                      isStudioPreview
                        ? `${
                            selectedField === 'ctaText'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-xl scale-105'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{ fontSize: section.ctaSize ? `${section.ctaSize}rem` : '0.75rem' }}
                    title={isStudioPreview ? 'Click to select / double-click to edit CTA button' : undefined}
                  >
                    <span>{section.ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Spacer for 3D model on the right */}
            <div className="lg:col-span-6 h-48 lg:h-64 pointer-events-none" />
          </div>
        )}

        {/* Layout: Right Text (3D Model on Left) */}
        {section.layout === 'right-text' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Spacer for 3D model on the left */}
            <div className="lg:col-span-6 h-48 lg:h-64 pointer-events-none" />

            <div
              className={`lg:col-span-6 flex flex-col justify-center cursor-context-menu relative ${
                isStudioPreview ? 'touch-none select-none group' : ''
              }`}
              style={{
                position: 'relative',
                zIndex: zIndexVal,
                transform: `translate(calc(${section.titleX ?? 0} * 0.75vw), calc(${section.titleY ?? 0} * 0.75vh))`,
              }}
              onPointerDown={handlePointerDown}
              onContextMenu={(e) => {
                e.stopPropagation();
                onContextMenu && onContextMenu(e, 'text');
              }}
              title={isStudioPreview ? "Drag to position with Magnetic Snap / Right-click for options" : undefined}
            >
              {isStudioPreview && (
                <div className="absolute -top-7 right-0 cursor-grab active:cursor-grabbing px-2.5 py-0.5 rounded-full bg-[#2563EB]/90 hover:bg-[#2563EB] text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg backdrop-blur-md z-40 transition-opacity opacity-80 group-hover:opacity-100">
                  <Move className="w-3 h-3 text-sky-300" />
                  <span>Drag & Magnetic Snap</span>
                </div>
              )}
              {section.badge && (
                <div
                  onClick={(e) => handleSelectField(e, 'badge')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'badge')}
                  className={`relative self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full uppercase bg-black/60 text-neutral-200 border border-white/20 mb-3 shadow-sm transition-all ${
                    isStudioPreview
                      ? `cursor-pointer ${
                          selectedField === 'badge'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-lg scale-105'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{ fontSize: section.badgeSize ? `${section.badgeSize}rem` : '0.7rem' }}
                  title={isStudioPreview ? 'Click to select / double-click to edit badge' : undefined}
                >
                  {renderSelectionOverlay('badge', 'Badge Tagline')}
                  <span>{section.badge}</span>
                </div>
              )}

              {section.title && (
                <div className="relative inline-block max-w-full">
                  {renderSelectionOverlay('title', 'Main Title')}
                  <h2
                    onClick={(e) => handleSelectField(e, 'title')}
                    onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                    className={`font-black tracking-tight mb-3 select-none transition-all ${
                      isStudioPreview
                        ? `cursor-pointer rounded-lg px-2 ${
                            selectedField === 'title'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{
                      fontSize: getTitleFontSize(section.titleSize, 'right-text'),
                      color: section.titleColor || '#ffffff',
                      fontFamily: section.titleFontFamily || 'inherit',
                      maxWidth: section.titleMaxWidth ? `${section.titleMaxWidth}%` : '100%',
                      lineHeight: section.titleLineHeight || 1.1,
                    }}
                    title={isStudioPreview ? 'Click to select / double-click to edit title' : undefined}
                  >
                    {section.title}
                  </h2>
                </div>
              )}

              {section.subtitle && (
                <div className="relative inline-block max-w-full">
                  {renderSelectionOverlay('subtitle', 'Subtitle / Story')}
                  <p
                    onClick={(e) => handleSelectField(e, 'subtitle')}
                    onDoubleClick={(e) => handleDoubleClick(e, 'subtitle')}
                    className={`leading-relaxed mb-4 opacity-95 transition-all ${
                      isStudioPreview
                        ? `cursor-pointer rounded-lg px-2 ${
                            selectedField === 'subtitle'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{
                      color: section.textColor || '#d4d4d8',
                      fontFamily: section.subtitleFontFamily || 'inherit',
                      fontSize: section.subtitleSize ? `${section.subtitleSize}rem` : undefined,
                      maxWidth: section.subtitleMaxWidth ? `${section.subtitleMaxWidth}%` : '32rem',
                      lineHeight: section.subtitleLineHeight || 1.6,
                    }}
                    title={isStudioPreview ? 'Click to select / double-click to edit subtitle' : undefined}
                  >
                    {section.subtitle}
                  </p>
                </div>
              )}

              {/* Spec Badges Grid */}
              {section.specs && section.specs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
                  {section.specs.map((spec, sIdx) => {
                    const fieldKey = `spec-${sIdx}`;
                    return (
                      <div
                        key={sIdx}
                        onClick={(e) => handleSelectField(e, fieldKey)}
                        onDoubleClick={(e) => handleDoubleClick(e, fieldKey)}
                        className={`relative p-3 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white shadow-lg transition-all ${
                          isStudioPreview
                            ? `cursor-pointer ${
                                selectedField === fieldKey
                                  ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/40 shadow-xl scale-105'
                                  : 'hover:ring-2 hover:ring-sky-400/80'
                              }`
                            : ''
                        }`}
                        title={isStudioPreview ? 'Click to select / double-click to edit spec' : undefined}
                      >
                        {renderSelectionOverlay(fieldKey, `Spec Item #${sIdx + 1}`)}
                        <div className="text-base sm:text-lg font-bold tracking-tight text-white">{spec.value}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          {spec.label}
                        </div>
                        {spec.detail && (
                          <div className="text-[9px] text-neutral-400 mt-0.5 truncate">
                            {spec.detail}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {section.ctaText && (
                <div className="relative inline-flex mt-2">
                  {renderSelectionOverlay('ctaText', 'CTA Button')}
                  <button
                    type="button"
                    onClick={(e) => {
                      if (isStudioPreview) {
                        handleSelectField(e, 'ctaText');
                      } else {
                        onScrollToNext?.();
                      }
                    }}
                    onDoubleClick={(e) => handleDoubleClick(e, 'ctaText')}
                    className={`px-4 py-2 rounded-full bg-white text-black font-semibold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer self-start ${
                      isStudioPreview
                        ? `${
                            selectedField === 'ctaText'
                              ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-xl scale-105'
                              : 'hover:ring-2 hover:ring-sky-400/80'
                          }`
                        : ''
                    }`}
                    style={{ fontSize: section.ctaSize ? `${section.ctaSize}rem` : '0.75rem' }}
                    title={isStudioPreview ? 'Click to select / double-click to edit CTA button' : undefined}
                  >
                    <span>{section.ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout: Split Specs / Minimal */}
        {(section.layout === 'split-specs' || section.layout === 'minimal') && (
          <div
            className="max-w-3xl mx-auto text-center flex flex-col items-center cursor-context-menu"
            style={{
              position: 'relative',
              zIndex: zIndexVal,
              transform: `translate(calc(${section.titleX ?? 0} * 0.75vw), calc(${section.titleY ?? 0} * 0.75vh))`,
            }}
            onContextMenu={(e) => {
              e.stopPropagation();
              onContextMenu && onContextMenu(e, 'text');
            }}
            title="Right-click for Layer options"
          >
            {section.badge && (
              <div
                onClick={(e) => handleSelectField(e, 'badge')}
                onDoubleClick={(e) => handleDoubleClick(e, 'badge')}
                className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full uppercase bg-black/60 text-neutral-200 border border-white/20 mb-3 shadow-sm transition-all ${
                  isStudioPreview
                    ? `cursor-pointer ${
                        selectedField === 'badge'
                          ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 shadow-lg scale-105'
                          : 'hover:ring-2 hover:ring-sky-400/80'
                      }`
                    : ''
                }`}
                style={{ fontSize: section.badgeSize ? `${section.badgeSize}rem` : '0.7rem' }}
                title={isStudioPreview ? 'Click to select / double-click to edit badge' : undefined}
              >
                {renderSelectionOverlay('badge', 'Badge Tagline')}
                <span>{section.badge}</span>
              </div>
            )}

            {section.title && (
              <div className="relative inline-block max-w-full">
                {renderSelectionOverlay('title', 'Main Title')}
                <h2
                  onClick={(e) => handleSelectField(e, 'title')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                  className={`font-black tracking-tight mb-3 select-none transition-all ${
                    isStudioPreview
                      ? `cursor-pointer rounded-lg px-2 ${
                          selectedField === 'title'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{
                    fontSize: getTitleFontSize(section.titleSize, section.layout),
                    color: section.titleColor || '#ffffff',
                    fontFamily: section.titleFontFamily || 'inherit',
                    maxWidth: section.titleMaxWidth ? `${section.titleMaxWidth}%` : '100%',
                    lineHeight: section.titleLineHeight || 1.1,
                  }}
                  title={isStudioPreview ? 'Click to select / double-click to edit title' : undefined}
                >
                  {section.title}
                </h2>
              </div>
            )}

            {section.subtitle && (
              <div className="relative inline-block max-w-full">
                {renderSelectionOverlay('subtitle', 'Subtitle / Story')}
                <p
                  onClick={(e) => handleSelectField(e, 'subtitle')}
                  onDoubleClick={(e) => handleDoubleClick(e, 'subtitle')}
                  className={`leading-relaxed mb-4 opacity-95 transition-all ${
                    isStudioPreview
                      ? `cursor-pointer rounded-lg px-2 ${
                          selectedField === 'subtitle'
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/20 shadow-xl'
                            : 'hover:ring-2 hover:ring-sky-400/80'
                        }`
                      : ''
                  }`}
                  style={{
                    color: section.textColor || '#d4d4d8',
                    fontFamily: section.subtitleFontFamily || 'inherit',
                    fontSize: section.subtitleSize ? `${section.subtitleSize}rem` : undefined,
                    maxWidth: section.subtitleMaxWidth ? `${section.subtitleMaxWidth}%` : '32rem',
                    lineHeight: section.subtitleLineHeight || 1.6,
                  }}
                  title={isStudioPreview ? 'Click to select / double-click to edit subtitle' : undefined}
                >
                  {section.subtitle}
                </p>
              </div>
            )}

            {section.specs && section.specs.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 my-4">
                {section.specs.map((spec, sIdx) => {
                  const fieldKey = `spec-${sIdx}`;
                  return (
                    <div
                      key={sIdx}
                      onClick={(e) => handleSelectField(e, fieldKey)}
                      onDoubleClick={(e) => handleDoubleClick(e, fieldKey)}
                      className={`relative px-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/80 text-white shadow-lg transition-all ${
                        isStudioPreview
                          ? `cursor-pointer ${
                              selectedField === fieldKey
                                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black/60 bg-sky-950/40 shadow-xl scale-105'
                                : 'hover:ring-2 hover:ring-sky-400/80'
                            }`
                          : ''
                      }`}
                      title={isStudioPreview ? 'Click to select / double-click to edit spec' : undefined}
                    >
                      {renderSelectionOverlay(fieldKey, `Spec Item #${sIdx + 1}`)}
                      <div className="text-lg font-black text-white">{spec.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-neutral-400">{spec.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Restore / Add Missing Elements Component Toolbar */}
        {isStudioPreview && onUpdateSection && (
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/10 opacity-80 hover:opacity-100 transition-opacity pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mr-1">
              Component Controls:
            </span>
            {!section.badge && (
              <button
                type="button"
                onClick={() => onUpdateSection({ badge: 'NEW BADGE TAGLINE' })}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-sky-400 text-xs font-medium border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Badge</span>
              </button>
            )}
            {!section.title && (
              <button
                type="button"
                onClick={() => onUpdateSection({ title: 'New Main Title' })}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-sky-400 text-xs font-medium border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Title</span>
              </button>
            )}
            {!section.subtitle && (
              <button
                type="button"
                onClick={() => onUpdateSection({ subtitle: 'Enter description or story paragraph text...' })}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-sky-400 text-xs font-medium border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Subtitle</span>
              </button>
            )}
            {!section.ctaText && (
              <button
                type="button"
                onClick={() => onUpdateSection({ ctaText: 'Learn More' })}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-sky-400 text-xs font-medium border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add CTA Button</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const currentSpecs = section.specs || [];
                onUpdateSection({ specs: [...currentSpecs, { label: 'SPEC', value: '100%' }] });
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-sky-400 text-xs font-medium border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add Spec Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Scroll Indicator at bottom of first section */}
      {isHero && !isStudioPreview && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-mono text-white/80">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-white/80" />
        </div>
      )}
    </div>
  );
}
