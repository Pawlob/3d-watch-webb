import React, { useRef, useEffect, useState } from 'react';
import { WebsiteConfig, getSectionBackgroundStyle } from '../types/builder';
import { ArrowUpRight, Menu, X, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { SectionView } from './SectionView';

interface ScrollPageProps {
  config: WebsiteConfig;
  onScrollProgress: (progress: number) => void;
  interactive?: boolean;
  activeSectionIndex?: number;
  onActiveSectionChange?: (index: number) => void;
  onSectionClick?: (index: number) => void;
  onContextMenu?: (e: React.MouseEvent, targetType: 'text' | '3d') => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ScrollPage({
  config,
  onScrollProgress,
  interactive = true,
  activeSectionIndex = 0,
  onActiveSectionChange,
  onSectionClick,
  onContextMenu,
  deviceMode = 'desktop',
}: ScrollPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(activeSectionIndex);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer when active section changes or on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isTabletOrMobile = deviceMode === 'tablet' || deviceMode === 'mobile';
  const mobileNavStyle = config.mobileNavbarStyle || 'hamburger';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isTicking = false;
    const handleScroll = () => {
      if (isTicking) return;
      isTicking = true;

      requestAnimationFrame(() => {
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const maxScroll = scrollHeight - clientHeight;
        const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
        onScrollProgress(progress);

        // Determine active section index accurately as soon as a section enters the viewport
        const sectionCount = config.sections.length;
        if (sectionCount > 0) {
          let activeIdx = 0;
          // Trigger section activation as soon as section top enters lower 85% of viewport
          const triggerLine = scrollTop + clientHeight * 0.85;
          for (let i = 0; i < sectionCount; i++) {
            const secEl = document.getElementById(`section-${i}`);
            if (secEl) {
              const top = secEl.offsetTop;
              if (triggerLine >= top) {
                activeIdx = i;
              }
            }
          }
          if (progress >= 0.99) {
            activeIdx = sectionCount - 1;
          }
          setCurrentSection(activeIdx);
          if (onActiveSectionChange) {
            onActiveSectionChange(activeIdx);
          }
        }
        isTicking = false;
      });
    };

    // Global wheel support: only forward wheel to container if target is outside container
    const handleWindowWheel = (e: WheelEvent) => {
      if (!container) return;
      // If event happened inside container, native overflow-y-auto handles scrolling
      if (container.contains(e.target as Node)) return;
      container.scrollTop += e.deltaY;
    };

    // Keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!container) return;
      if (e.key === 'ArrowDown') {
        container.scrollBy({ top: 140, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        container.scrollBy({ top: -140, behavior: 'smooth' });
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        container.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        container.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    // Initial check on mount
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWindowWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.sections.length, onScrollProgress, onActiveSectionChange]);

  const scrollToSection = (index: number) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth selection:bg-neutral-800 selection:text-white outline-none pointer-events-auto"
      onContextMenu={(e) => onContextMenu && onContextMenu(e, '3d')}
    >
      {/* Sticky Top Header / Navbar */}
      <header className="sticky top-0 left-0 right-0 z-40 w-full backdrop-blur-md bg-black/70 border-b border-white/10 transition-colors pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black tracking-tight text-lg select-none text-white drop-shadow-sm">
              {config.brandName || '3D Showcase'}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
              Interactive 3D
            </span>
          </div>

          {/* Desktop Navigation (Hidden on Tablet & Mobile) */}
          {(!isTabletOrMobile && mobileNavStyle !== 'hidden') && (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {config.sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(idx)}
                  className={`transition-colors cursor-pointer ${
                    currentSection === idx
                      ? 'text-sky-400 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {section.name || `Section ${idx + 1}`}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* CTA Button */}
            <button
              onClick={() => {
                scrollToSection(config.sections.length - 1);
                setIsMobileMenuOpen(false);
              }}
              className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{config.headerCtaText || 'Pre-Order'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Hamburger Toggle Button for Tablet & Mobile Viewports */}
            {(mobileNavStyle === 'hamburger' || isTabletOrMobile) && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`p-2 rounded-xl bg-neutral-900/90 border border-neutral-700 hover:border-sky-500/60 text-white hover:bg-neutral-800 transition cursor-pointer active:scale-95 flex items-center justify-center ${
                  isTabletOrMobile ? 'flex' : 'lg:hidden flex'
                }`}
                aria-label="Toggle Navigation Menu"
                title={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-sky-400" />
                ) : (
                  <Menu className="w-5 h-5 text-neutral-200" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hamburger Mobile & Tablet Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="w-full bg-neutral-950/95 border-b border-neutral-800 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
              {/* Drawer Subheader */}
              <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800/80">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sections & Keyframes ({config.sections.length})</span>
                </span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {deviceMode.toUpperCase()} Nav
                </span>
              </div>

              {/* Section Links Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {config.sections.map((section, idx) => {
                  const isActive = currentSection === idx;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(idx);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                        isActive
                          ? 'bg-sky-950/70 border-sky-500 text-sky-300 shadow-md ring-1 ring-sky-500/40'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-sky-500 text-white border-sky-400'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate">{section.name || section.title || `Section ${idx + 1}`}</div>
                          <div className="text-[10px] text-neutral-400 capitalize">
                            {section.layout} • {section.theme}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-sky-400 translate-x-0.5' : 'text-neutral-500'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Active: {config.sections[currentSection]?.name || `Section ${currentSection + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition cursor-pointer"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Render Each Section using the unified SectionView */}
      <div className="relative w-full">
        {config.sections.map((section, idx) => (
          <section
            key={section.id}
            id={`section-${idx}`}
            onClick={() => onSectionClick && onSectionClick(idx)}
            className="min-h-screen w-full flex items-center justify-center relative transition-colors duration-500 bg-transparent"
          >
            <SectionView
              section={section}
              sectionIndex={idx}
              totalSections={config.sections.length}
              isStudioPreview={false}
              onScrollToNext={() => scrollToSection(idx + 1 < config.sections.length ? idx + 1 : 0)}
              onContextMenu={onContextMenu}
            />
          </section>
        ))}

        {/* Footer */}
        <footer className="w-full py-16 px-6 bg-black text-white border-t border-neutral-800 text-center relative z-20 pointer-events-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold tracking-tight">{config.brandName || '3D Experience'}</h3>
            <p className="text-neutral-400 text-sm max-w-md">
              Built with interactive 3D Scroll Studio. Smooth camera scrubbing, customizable keyframes, and full responsive layout.
            </p>
            <div className="text-xs text-neutral-500 pt-6">
              © {new Date().getFullYear()} {config.brandName}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
