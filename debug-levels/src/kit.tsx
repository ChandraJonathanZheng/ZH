import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { evalMoves, type Moves } from "./Choreo";
import { Mascot } from "./Mascot";
import voiceover from "./voiceover.json";

// Shared building blocks for every scene: background, captions,
// reveal-with-sound, punch-ins, and the mascot that follows its choreography.

export const C = {
  bg: "#0E1424",
  black: "#06080F",
  yellow: "#FFC857",
  cyan: "#4CC9F0",
  pink: "#FF6B9D",
  green: "#5EE38B",
  purple: "#A78BFA",
  red: "#FF5964",
  dim: "#8B95B5",
};
export const FONT = "Inter, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

type Line = { text: string | null; say: string; file: string; start: number; dur: number };
type SceneVO = { id: string; seconds: number; frames: number; lines: Line[] };
export const VO = voiceover as SceneVO[];

export const scene = (id: string): SceneVO => {
  const s = VO.find((v) => v.id === id);
  if (!s) throw new Error(`No voiceover for scene ${id}`);
  return s;
};

// Seconds (inside the scene) when a VO line starts/ends, plus an offset.
// Visuals hang off the REAL audio timing instead of guessed numbers.
export const at = (id: string, line: number, offset = 0) => scene(id).lines[line].start + offset;
export const end = (id: string, line: number, offset = 0) => {
  const l = scene(id).lines[line];
  return l.start + l.dur + offset;
};

export type Sfx =
  | "pop"
  | "typing"
  | "ding"
  | "click"
  | "tick"
  | "key"
  | "quack"
  | "error"
  | "steps"
  | "impact";
// Kept well under the voice: SFX should be felt more than heard.
const SFX_VOL: Record<Sfx, number> = {
  pop: 0.16,
  typing: 0.16,
  ding: 0.22,
  click: 0.4,
  tick: 0.3,
  key: 0.18,
  quack: 0.18,
  error: 0.14,
  steps: 0.4,
  impact: 0.45,
};

export const Sound: React.FC<{ at: number; sfx: Sfx; volume?: number; seconds?: number }> = ({
  at: t,
  sfx,
  volume,
  seconds,
}) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence
      from={Math.round(t * fps)}
      durationInFrames={seconds ? Math.round(seconds * fps) : undefined}
      layout="none"
    >
      <Audio src={staticFile(`sfx/${sfx}.mp3`)} volume={volume ?? SFX_VOL[sfx]} />
    </Sequence>
  );
};

// Snaps its children in at time `at` (fast spring, no slow fades).
export const Reveal: React.FC<{
  at: number;
  until?: number; // hard-cut out (graphic replacement)
  sfx?: Sfx | null;
  from?: "pop" | "up" | "down" | "left" | "right";
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at: t, until, sfx = null, from = "pop", style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = Math.round(t * fps);
  if (frame < f0 || (until !== undefined && frame >= Math.round(until * fps))) {
    return sfx ? <Sound at={t} sfx={sfx} /> : null;
  }
  const p = spring({ frame: frame - f0, fps, config: { damping: 14, stiffness: 260 } });
  const off = 1 - p;
  const translate =
    from === "up"
      ? `0 ${off * 90}px`
      : from === "down"
        ? `0 ${-off * 90}px`
        : from === "left"
          ? `${-off * 600}px 0`
          : from === "right"
            ? `${off * 600}px 0`
            : "0 0";
  return (
    <>
      {sfx && <Sound at={t} sfx={sfx} />}
      <div style={{ scale: from === "pop" ? String(0.6 + 0.4 * p) : undefined, translate, ...style }}>{children}</div>
    </>
  );
};

export const Big: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size, color = "#fff", style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: -2,
      color,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.cyan,
  size = 44,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      whiteSpace: "nowrap",
      padding: `${size * 0.28}px ${size * 0.65}px`,
      borderRadius: 999,
      background: color,
      color: C.bg,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; title?: string; accent?: string; style?: React.CSSProperties }> = ({
  children,
  title,
  accent = C.cyan,
  style,
}) => (
  <div
    style={{
      width: 900,
      borderRadius: 28,
      background: "#141B30",
      border: `3px solid ${accent}`,
      overflow: "hidden",
      ...style,
    }}
  >
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "rgba(255,255,255,0.05)" }}>
        {[C.red, C.yellow, C.green].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
        ))}
        <div style={{ fontFamily: MONO, fontSize: 28, color: C.dim, marginLeft: 10 }}>{title}</div>
      </div>
    )}
    <div style={{ padding: 28 }}>{children}</div>
  </div>
);

// Compact "LEVEL n · label" header. Snaps in, no spinning.
export const LevelTag: React.FC<{ n: number; label: string; color: string }> = ({ n, label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 260 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, translate: `${(1 - p) * -80}px 0`, opacity: p }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 26,
          background: color,
          color: C.bg,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color, letterSpacing: 6 }}>LEVEL {n}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#fff", lineHeight: 1 }}>{label}</div>
      </div>
    </div>
  );
};

// The comedy escalation: a rank stamp that slaps on, slightly rotated.
export const Rank: React.FC<{ at: number; children: React.ReactNode; color: string; style?: React.CSSProperties }> = ({
  at: t,
  children,
  color,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = Math.round(t * fps);
  if (frame < f0) return null;
  const p = spring({ frame: frame - f0, fps, config: { damping: 12, stiffness: 300 } });
  return (
    <>
      <Sound at={t} sfx="tick" />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 150,
          rotate: "6deg",
          scale: String(1.6 - 0.6 * p),
          opacity: Math.min(1, p * 2),
          border: `5px solid ${color}`,
          color,
          borderRadius: 14,
          padding: "6px 18px",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: 3,
          whiteSpace: "nowrap",
          background: C.bg,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
};

// Seven segments at the very top: how far into the countdown we are.
export const Progress: React.FC<{ level: number }> = ({ level }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 60, left: 80, right: 80, display: "flex", gap: 10 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => {
        const fill = i < level ? 1 : i === level ? interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }) : 0;
        return (
          <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", background: i === 7 ? C.red : C.yellow }} />
          </div>
        );
      })}
    </div>
  );
};

export const Background: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <AbsoluteFill style={{ background: dark ? C.black : C.bg }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,${dark ? 0.035 : 0.06}) 2px, transparent 2px)`,
        backgroundSize: "48px 48px",
      }}
    />
  </AbsoluteFill>
);

// Subtitle: only for lines the main graphic does not already show.
// *word* is highlighted.
const Caption: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lines = scene(id).lines;
  const line = lines.find((l) => t >= l.start && t < l.start + l.dur + 0.25);
  if (!line || !line.text) return null;
  const p = spring({ frame: frame - Math.round(line.start * fps), fps, config: { damping: 14, stiffness: 300 } });
  const parts = line.text.split("*");
  return (
    <div style={{ position: "absolute", top: 900, left: 80, right: 80, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.2,
          color: "#fff",
          textAlign: "center",
          translate: `0 ${(1 - p) * 20}px`,
          opacity: p,
        }}
      >
        {parts.map((s, i) =>
          i % 2 ? (
            <span key={i} style={{ color: C.yellow }}>
              {s}
            </span>
          ) : (
            <React.Fragment key={i}>{s}</React.Fragment>
          ),
        )}
      </div>
    </div>
  );
};

// One scene = background + content + caption + mascot + its voice lines.
export const Stage: React.FC<{
  id: string;
  moves: Moves;
  dark?: boolean;
  still?: boolean;
  level?: number;
  punches?: number[]; // quick punch-in times (seconds): pattern interrupts
  shake?: [number, number][];
  under?: React.ReactNode; // drawn behind the mascot
  over?: React.ReactNode; // drawn in front of everything
  children: React.ReactNode;
}> = ({ id, moves, dark, still, level, punches = [], shake = [], under, over, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = scene(id);
  const pose = evalMoves(moves, frame, fps);
  const talking = s.lines.some((l) => t >= l.start && t <= l.start + l.dur);
  const shaking = shake.some(([a, b]) => t >= a && t <= b);
  const sx = shaking ? Math.sin(frame * 2.7) * 8 : 0;
  const sy = shaking ? Math.cos(frame * 3.1) * 6 : 0;
  // Punch-in: jump to 106% instantly, settle back over ~0.3 s.
  const punch = punches.reduce((acc, p) => {
    const d = t - p;
    return d >= 0 && d < 0.35 ? Math.max(acc, 0.06 * (1 - Easing.out(Easing.cubic)(d / 0.35))) : acc;
  }, 0);

  return (
    <AbsoluteFill style={{ translate: `${sx}px ${sy}px`, scale: String(1 + punch) }}>
      <Background dark={dark} />
      {level !== undefined && <Progress level={level} />}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          height: 770,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        {children}
      </div>
      <Caption id={id} />
      {under}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 280,
          width: 520,
          translate: `${pose.x}px ${-pose.y}px`,
          scale: String(pose.scale),
          transformOrigin: "50% 100%",
        }}
      >
        <Mascot pose={pose} talking={talking} frame={frame} width={520} still={still} />
      </div>
      {over}
      {s.lines.map((l) => (
        <Sequence key={l.file} from={Math.round(l.start * fps)} layout="none">
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
