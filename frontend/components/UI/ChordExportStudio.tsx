'use client';

import React, { useState, useCallback } from 'react';
import { InstrumentType, ChordFingering, Tuning } from '@/lib/types';
import { Download, Share2, Check, Copy, Image, Sparkles, Link2 } from 'lucide-react';

interface ChordExportStudioProps {
  chord: ChordFingering;
  tuning: Tuning;
  instrument: InstrumentType;
  capoFret: number;
  voicingIndex: number;
}

export const ChordExportStudio: React.FC<ChordExportStudioProps> = ({
  chord,
  tuning,
  instrument,
  capoFret,
  voicingIndex,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const displayChordName = chord.chord_name || `${chord.root}${chord.quality === 'maj' ? '' : chord.quality}`;

  // Generate share URL
  const generateShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('inst', instrument);
    url.searchParams.set('root', chord.root);
    url.searchParams.set('quality', chord.quality);
    url.searchParams.set('voicing', String(voicingIndex));
    url.searchParams.set('capo', String(capoFret));
    url.searchParams.set('tuning', tuning.id);
    return url.toString();
  }, [instrument, chord.root, chord.quality, voicingIndex, capoFret, tuning.id]);

  const handleCopyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setShowToast('Shareable link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setShowToast(null);
    }, 3000);
  };

  // Generate SVG markup for the chord diagram card
  const generateSvgString = (): string => {
    const width = 600;
    const height = 480;
    const numStrings = instrument === 'guitar' ? 6 : 4;
    const numFrets = 5;

    const boardLeft = 140;
    const boardTop = 130;
    const boardWidth = 360;
    const boardHeight = 260;
    const fretStep = boardHeight / numFrets;
    const stringStep = boardWidth / (numStrings - 1);

    // Compute min / base fret
    const activeFrets = chord.frets.filter((f) => f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
    const baseFret = minFret > 3 ? minFret : 1;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `
      <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde68a"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </radialGradient>
      </defs>

      <!-- Background Card -->
      <rect width="${width}" height="${height}" rx="28" fill="url(#cardBg)" stroke="#334155" stroke-width="2"/>

      <!-- Header Info -->
      <text x="50" y="60" fill="#f8fafc" font-size="34" font-weight="900" font-family="system-ui, sans-serif">${displayChordName}</text>
      <text x="50" y="88" fill="#94a3b8" font-size="13" font-weight="700" font-family="monospace" letter-spacing="1">
        ${instrument.toUpperCase()} • ${tuning.name.toUpperCase()} ${capoFret > 0 ? `• CAPO ${capoFret}` : ''}
      </text>

      <!-- Watermark Badge -->
      <rect x="420" y="40" width="130" height="28" rx="8" fill="#f59e0b" fill-opacity="0.12" stroke="#f59e0b" stroke-opacity="0.4"/>
      <text x="485" y="58" fill="#fbbf24" font-size="11" font-weight="800" font-family="sans-serif" text-anchor="middle">CHORDGRID PRO</text>

      <!-- Fretboard Board -->
      <rect x="${boardLeft}" y="${boardTop}" width="${boardWidth}" height="${boardHeight}" fill="#111827" stroke="#334155" stroke-width="1.5" rx="4"/>
    `;

    // Nut line (if baseFret is 1, draw thick white nut)
    if (baseFret === 1) {
      svg += `<line x1="${boardLeft}" y1="${boardTop}" x2="${boardLeft + boardWidth}" y2="${boardTop}" stroke="#f8fafc" stroke-width="6"/>`;
    } else {
      svg += `<text x="${boardLeft - 30}" y="${boardTop + 30}" fill="#fbbf24" font-size="16" font-weight="900" font-family="monospace">${baseFret}fr</text>`;
    }

    // Fret lines
    for (let f = 1; f <= numFrets; f++) {
      const y = boardTop + f * fretStep;
      svg += `<line x1="${boardLeft}" y1="${y}" x2="${boardLeft + boardWidth}" y2="${y}" stroke="#475569" stroke-width="1.5"/>`;
    }

    // Strings & Tuning Note Names
    for (let s = 0; s < numStrings; s++) {
      const x = boardLeft + s * stringStep;
      svg += `<line x1="${x}" y1="${boardTop}" x2="${x}" y2="${boardTop + boardHeight}" stroke="#94a3b8" stroke-width="${s === 0 ? 2.5 : 1.5}"/>`;

      const note = tuning.notes[s] || '';
      svg += `<text x="${x}" y="${boardTop + boardHeight + 25}" fill="#64748b" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle">${note}</text>`;
    }

    // Nut status (O / X) and Active Fret Dots
    chord.frets.forEach((fret, strIdx) => {
      const x = boardLeft + strIdx * stringStep;

      if (fret === -1) {
        // Muted X
        svg += `<text x="${x}" y="${boardTop - 15}" fill="#ef4444" font-size="16" font-weight="900" font-family="sans-serif" text-anchor="middle">✕</text>`;
      } else if (fret === 0) {
        // Open O
        svg += `<circle cx="${x}" cy="${boardTop - 20}" r="7" fill="none" stroke="#10b981" stroke-width="2"/>`;
      } else {
        // Fretted Note Dot
        const relFret = baseFret === 1 ? fret : fret - baseFret + 1;
        if (relFret >= 1 && relFret <= numFrets) {
          const cy = boardTop + (relFret - 0.5) * fretStep;
          svg += `<circle cx="${x}" cy="${cy}" r="14" fill="url(#amberGlow)" stroke="#ffffff" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>`;

          const finger = chord.fingers ? chord.fingers[strIdx] : 0;
          if (finger && finger > 0) {
            svg += `<text x="${x}" y="${cy + 5}" fill="#0f172a" font-size="13" font-weight="900" font-family="sans-serif" text-anchor="middle">${finger}</text>`;
          }
        }
      }
    });

    // Footer
    svg += `
      <text x="300" y="${height - 20}" fill="#475569" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="middle">
        Generated with ChordGrid • https://chordgrid.app
      </text>
    </svg>`;

    return svg;
  };

  const handleDownloadSvg = () => {
    const svgData = generateSvgString();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordgrid-${instrument}-${displayChordName.toLowerCase().replace(/[^a-z0-9]/g, '')}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setShowToast('SVG Chord Diagram downloaded!');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDownloadPng = () => {
    setIsExporting(true);
    const svgData = generateSvgString();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 2x Retina resolution
      const scale = 2;
      canvas.width = 600 * scale;
      canvas.height = 480 * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `chordgrid-${instrument}-${displayChordName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
            link.click();
            URL.revokeObjectURL(pngUrl);
            setShowToast('High-Res PNG Chord Diagram downloaded!');
            setTimeout(() => setShowToast(null), 3000);
          }
          setIsExporting(false);
          URL.revokeObjectURL(url);
        }, 'image/png');
      } else {
        setIsExporting(false);
      }
    };

    img.onerror = () => {
      setIsExporting(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-studio-panel">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 rounded-xl bg-emerald-500 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-lg animate-fade-in">
          <Check className="h-3.5 w-3.5" />
          <span>{showToast}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              Export &amp; Share Studio
            </h4>
            <p className="text-[11px] text-slate-400">
              Download studio chord cards or share exact link
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
              copiedLink
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Copy shareable URL link with exact chord, tuning, and capo settings"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5 text-amber-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700 transition"
            title="Download vector SVG diagram"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-glow-amber transition"
            title="Download high-resolution 2x PNG card"
          >
            <Image className="h-3.5 w-3.5 text-slate-950" />
            <span>{isExporting ? 'Exporting...' : 'HD PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
