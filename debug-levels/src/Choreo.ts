import { Easing, interpolate } from "remotion";
import type { Mood, Pose } from "./Mascot";

// Choreography is DATA (like a config file). evalMoves() is the renderer
// that turns it into a pose for one frame. Times are in seconds.

export type Key = {
  t: number;
  x?: number;
  armL?: number;
  armR?: number;
  lean?: number;
  lookX?: number;
  lookY?: number;
  headRot?: number;
  scale?: number;
  mood?: Mood;
};
export type Sway = {
  from: number;
  to: number;
  hz: number;
  x?: number;
  lean?: number;
  armL?: number;
  armR?: number;
  headRot?: number;
  headDip?: number;
};
export type Hop = { t: number; h: number; d?: number };
export type Moves = { keys: Key[]; sways?: Sway[]; hops?: Hop[] };

type NumField = "x" | "armL" | "armR" | "lean" | "lookX" | "lookY" | "headRot" | "scale";
const DEFAULTS: Record<NumField, number> = {
  x: 0,
  armL: 6,
  armR: -6,
  lean: 0,
  lookX: 0,
  lookY: 0,
  headRot: 0,
  scale: 1,
};

const ease = Easing.inOut(Easing.cubic);

const track = (keys: Key[], field: NumField, t: number): number => {
  const pts = keys.filter((k) => k[field] !== undefined) as (Key & Record<NumField, number>)[];
  if (pts.length === 0) return DEFAULTS[field];
  if (t <= pts[0].t) return pts[0][field];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (t <= b.t) {
      return interpolate(t, [a.t, b.t], [a[field], b[field]], { easing: ease });
    }
  }
  return pts[pts.length - 1][field];
};

const moodAt = (keys: Key[], t: number): Mood => {
  let mood: Mood = "happy";
  for (const k of keys) if (k.mood && k.t <= t) mood = k.mood;
  return mood;
};

export type Evaluated = Pose & { x: number; y: number; scale: number };

export const evalMoves = (moves: Moves, frame: number, fps: number): Evaluated => {
  const t = frame / fps;
  const v: Record<NumField, number> = {
    x: track(moves.keys, "x", t),
    armL: track(moves.keys, "armL", t),
    armR: track(moves.keys, "armR", t),
    lean: track(moves.keys, "lean", t),
    lookX: track(moves.keys, "lookX", t),
    lookY: track(moves.keys, "lookY", t),
    headRot: track(moves.keys, "headRot", t),
    scale: track(moves.keys, "scale", t),
  };
  let headDip = 0;

  for (const s of moves.sways ?? []) {
    if (t < s.from || t > s.to) continue;
    const fade = Math.min(1, (t - s.from) / 0.25, (s.to - t) / 0.25);
    const w = Math.sin((t - s.from) * s.hz * Math.PI * 2) * fade;
    v.x += (s.x ?? 0) * w;
    v.lean += (s.lean ?? 0) * w;
    v.armL += (s.armL ?? 0) * w;
    v.armR += (s.armR ?? 0) * w;
    v.headRot += (s.headRot ?? 0) * w;
    headDip += (s.headDip ?? 0) * Math.abs(w);
  }

  let y = 0;
  for (const h of moves.hops ?? []) {
    const d = h.d ?? 0.45;
    if (t >= h.t && t <= h.t + d) {
      const p = (t - h.t) / d;
      y += Math.sin(p * Math.PI) * h.h;
      const fling = Math.sin(p * Math.PI) * 70;
      v.armL += fling;
      v.armR -= fling;
    }
  }

  // Walking is derived from horizontal speed, so moving x = walking legs.
  const dt = 1 / fps;
  const speed = (track(moves.keys, "x", t + dt) - track(moves.keys, "x", t - dt)) / (2 * dt);
  const walking = Math.abs(speed) > 25;
  const walkPhase = t * 2.2 * Math.PI * 2;
  const bob = walking ? Math.abs(Math.sin(walkPhase)) * 10 : 0;
  if (walking) v.lean += Math.sign(speed) * 3;

  return {
    x: v.x,
    y,
    scale: v.scale,
    armL: v.armL,
    armR: v.armR,
    lean: v.lean,
    lookX: v.lookX,
    lookY: v.lookY,
    headRot: v.headRot,
    headDip,
    mood: moodAt(moves.keys, t),
    walking,
    walkPhase,
    bob,
  };
};
