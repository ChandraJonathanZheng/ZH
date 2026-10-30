import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
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
// reveal-with-sound, and the mascot that follows its choreography.

export const C = {
  bg: "#0E1424",
  yellow: "#FFC857",
  cyan: "#4CC9F0",
  pink: "#FF6B9D",
  green: "#5EE38B",
  purple: "#A78BFA",
  red: "#FF5964",
};
export const FONT = "Inter, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

type Line = { text: string; file: string; start: number; dur: number };
type SceneVO = { id: string; seconds: number; frames: number; lines: Line[] };
export const VO = voiceover as SceneVO[];

export const scene = (id: string): SceneVO => {
  const s = VO.find((v) => v.id === id);
  if (!s) throw new Error(`No voiceover for scene ${id}`);
  return s;
};

// Seconds (inside the scene) when a VO line starts, plus an offset.
// Visuals hang off the REAL audio timing instead of guessed numbers.
export const at = (id: string, line: number, offset = 0) => scene(id).lines[line].start + offset;
export const end = (id: string, line: number, offset = 0) => {
  const l = scene(id).lines[line];
  return l.start + l.dur + offset;
};

export type Sfx = "pop" | "whoosh" | "typing" | "boom" | "ding" | "sparkle" | "boing";
const SFX_VOL: Record<Sfx, number> = {
  pop: 0.3,
  whoosh: 0.28,
  typing: 0.3,
  boom: 0.6,
  ding: 0.45,
  sparkle: 0.35,
  boing: 0.5,
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

// Springs its children in at time `at` and plays a sound with it,
// so every new element gets an entrance + sound for free.
export const Reveal: React.FC<{
  at: number;
  sfx?: Sfx | null;
  from?: "pop" | "up" | "left" | "right";
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at: t, sfx = "pop", from = "pop", style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = Math.round(t * fps);
  const p = spring({ frame: frame - f0, fps, config: { damping: 11, stiffness: 140 } });
  const off = 1 - p;
  const translate =
    from === "up" ? `0 ${off * 120}px` : from === "left" ? `${-off * 500}px 0` : from === "right" ? `${off * 500}px 0` : "0 0";
  return (
    <>
      {sfx && <Sound at={t} sfx={sfx} />}
      <div
        style={{
          opacity: frame < f0 ? 0 : Math.min(1, p * 1.5),
          scale: from === "pop" ? String(0.3 + 0.7 * p) : undefined,
          translate,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
};

export const Gradient: React.FC<{
  children: React.ReactNode;
  size: number;
  colors?: [string, string];
  style?: React.CSSProperties;
}> = ({ children, size, colors = [C.yellow, C.pink], style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: -2,
      background: `linear-gradient(100deg, ${colors[0]}, ${colors[1]})`,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      filter: `drop-shadow(0 8px 0 rgba(0,0,0,0.35))`,
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
      padding: `${size * 0.3}px ${size * 0.7}px`,
      borderRadius: 999,
      background: color,
      color: "#0E1424",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      boxShadow: `0 8px 0 rgba(0,0,0,0.35), 0 0 40px ${color}66`,
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
      borderRadius: 32,
      background: "rgba(16,22,40,0.92)",
      border: `4px solid ${accent}`,
      boxShadow: `0 16px 0 rgba(0,0,0,0.4), 0 0 60px ${accent}44`,
      overflow: "hidden",
      ...style,
    }}
  >
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", background: "rgba(255,255,255,0.06)" }}>
        {[C.red, C.yellow, C.green].map((c) => (
          <div key={c} style={{ width: 22, height: 22, borderRadius: 11, background: c }} />
        ))}
        <div style={{ fontFamily: MONO, fontSize: 30, color: "#9AA7C7", marginLeft: 12 }}>{title}</div>
      </div>
    )}
    <div style={{ padding: 30 }}>{children}</div>
  </div>
);

// Big "LEVEL n" badge with a spinning gradient circle.
export const LevelBadge: React.FC<{ n: number; label: string; color: string }> = ({ n, label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 3, fps, config: { damping: 9 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, scale: String(p), rotate: `${(1 - p) * -40}deg` }}>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 85,
          background: `conic-gradient(from ${frame * 4}deg, ${color}, ${C.pink}, ${C.yellow}, ${color})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 10px 0 rgba(0,0,0,0.35), 0 0 60px ${color}88`,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            background: C.bg,
            color: "#fff",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color, letterSpacing: 8 }}>LEVEL {n}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#fff", lineHeight: 1.05, maxWidth: 640 }}>{label}</div>
      </div>
    </div>
  );
};

// Seven segments at the very top: where we are in the countdown.
export const Progress: React.FC<{ level: number }> = ({ level }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 50, left: 80, right: 80, display: "flex", gap: 12 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => {
        const fill = i < level ? 1 : i === level ? interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) : 0;
        return (
          <div key={i} style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.pink})` }} />
          </div>
        );
      })}
    </div>
  );
};

const GLYPHS = ["{ }", "</>", "=>", ";", "( )", "[ ]", "&&", "!=", "#", "fn"];

export const Background: React.FC<{ accent: string; dark?: boolean }> = ({ accent, dark }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: dark ? "#05070D" : C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          translate: `0 ${(frame * 0.6) % 48}px`,
        }}
      />
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            borderRadius: 450,
            background: i === 0 ? accent : C.purple,
            opacity: dark ? 0.12 : 0.22,
            filter: "blur(160px)",
            left: (i === 0 ? -250 : 450) + Math.sin(frame / 40 + i * 2) * 120,
            top: (i === 0 ? 150 : 1000) + Math.cos(frame / 50 + i) * 140,
          }}
        />
      ))}
      {GLYPHS.map((g, i) => {
        const x = random(`gx${i}`) * 1000;
        const speed = 0.6 + random(`gs${i}`) * 1.2;
        const y = 1950 - ((frame * speed + random(`gy${i}`) * 2000) % 2100);
        return (
          <div
            key={g}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 40 + random(`gf${i}`) * 40,
              color: i % 2 ? accent : "#fff",
              opacity: 0.12,
              rotate: `${Math.sin(frame / 30 + i) * 15}deg`,
            }}
          >
            {g}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Confetti: React.FC<{ at: number; count?: number }> = ({ at: t, count = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - t * fps;
  if (f < 0 || f > 70) return null;
  const colors = [C.yellow, C.pink, C.cyan, C.green, C.purple];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = random(`ca${i}${t}`) * Math.PI * 2;
        const v = 18 + random(`cv${i}${t}`) * 22;
        const x = 540 + Math.cos(a) * v * f;
        const y = 700 + Math.sin(a) * v * f * 0.7 + 0.9 * f * f;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18,
              height: 30,
              borderRadius: 4,
              background: colors[i % colors.length],
              rotate: `${f * 12 + i * 40}deg`,
              opacity: interpolate(f, [50, 70], [1, 0], { extrapolateLeft: "clamp" }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lines = scene(id).lines;
  const idx = lines.findIndex((l, i) => t >= l.start && (i === lines.length - 1 || t < lines[i + 1].start));
  if (idx < 0) return null;
  const line = lines[idx];
  const p = spring({ frame: frame - Math.round(line.start * fps), fps, config: { damping: 12, stiffness: 180 } });
  const m = line.text.match(/^(Level \d:)(.*)$/);
  return (
    <div style={{ position: "absolute", top: 880, left: 60, right: 60, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 46,
          color: "#fff",
          textAlign: "center",
          padding: "16px 30px",
          borderRadius: 24,
          background: "rgba(0,0,0,0.45)",
          textShadow: "0 4px 0 rgba(0,0,0,0.6)",
          scale: String(0.85 + 0.15 * p),
          opacity: p,
        }}
      >
        {m ? (
          <>
            <span style={{ color: C.yellow }}>{m[1]}</span>
            {m[2]}
          </>
        ) : (
          line.text
        )}
      </div>
    </div>
  );
};

// One scene = background + content + caption + mascot + its voice lines.
export const Stage: React.FC<{
  id: string;
  accent: string;
  moves: Moves;
  dark?: boolean;
  whoosh?: boolean;
  level?: number;
  shake?: [number, number][]; // [from, to] seconds of screen shake
  under?: React.ReactNode; // props drawn behind the mascot (floor level)
  children: React.ReactNode;
}> = ({ id, accent, moves, dark, whoosh = true, level, shake = [], under, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s = scene(id);
  const pose = evalMoves(moves, frame, fps);
  const talking = s.lines.some((l) => t >= l.start && t <= l.start + l.dur);
  const shaking = shake.some(([a, b]) => t >= a && t <= b);
  const sx = shaking ? Math.sin(frame * 2.7) * 14 : 0;
  const sy = shaking ? Math.cos(frame * 3.1) * 10 : 0;
  const enter = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ translate: `${sx}px ${sy}px` }}>
      <Background accent={accent} dark={dark} />
      {level !== undefined && <Progress level={level} />}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          height: 750,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          opacity: enter,
          scale: String(0.94 + 0.06 * enter),
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
        <Mascot pose={pose} talking={talking} frame={frame} width={520} />
      </div>
      {whoosh && <Sound at={0} sfx="whoosh" />}
      {s.lines.map((l) => (
        <Sequence key={l.file} from={Math.round(l.start * fps)} layout="none">
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
      {(moves.hops ?? []).map((h) => (
        <Sound key={`hop${h.t}`} at={h.t} sfx="pop" volume={0.22} />
      ))}
    </AbsoluteFill>
  );
};
