import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChordGrid — Ukulele & Guitar Fretboard Visualizer & Audio Synthesizer',
  description: 'Interactive SVG fretboard visualizer and physical-modeling audio synthesizer for guitar and ukulele chord charts, fingerings, and alternate tunings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
