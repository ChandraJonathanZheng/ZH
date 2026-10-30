import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { at, C, Card, Confetti, end, FONT, Gradient, LevelBadge, MONO, Pill, Reveal, Sound, Stage } from "./kit";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

// Typewriter text: shows `text` letter by letter from `from` seconds.
const Type: React.FC<{ text: string; from: number; cps?: number; style?: React.CSSProperties }> = ({
  text,
  from,
  cps = 22,
  style,
}) => {
  const { t, frame } = useT();
  const n = Math.max(0, Math.min(text.length, Math.floor((t - from) * cps)));
  if (t < from) return null;
  const caret = n < text.length || Math.floor(frame / 15) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {caret && <span style={{ color: C.cyan }}>▍</span>}
    </span>
  );
};

/* ---------------- HOOK ---------------- */
export const Hook: React.FC = () => {
  const id = "hook";
  const { t } = useT();
  const stuck = at(id, 1, 0.9);
  return (
    <Stage
      id={id}
      accent={C.pink}
      whoosh={false}
      moves={{
        keys: [
          { t: 0, x: 420, mood: "happy", armR: -6 },
          { t: 1.3, x: 0, armR: -150 },
          { t: 2.0, armR: -120, mood: "think", lookY: -1 },
          { t: stuck, armR: -100, mood: "wow", lookX: 0.6 },
          { t: stuck + 0.9, armR: -20, armL: 60, mood: "laugh" },
        ],
        sways: [{ from: 1.2, to: 2.0, hz: 3, armR: 25 }],
        hops: [{ t: stuck, h: 80 }],
      }}
      shake={[[stuck, stuck + 0.3]]}
    >
      <Reveal at={0.1} from="up">
        <Gradient size={300}>7</Gradient>
      </Reveal>
      <Reveal at={0.5} from="up">
        <Gradient size={110} colors={["#fff", C.cyan]}>
          LEVELS OF
        </Gradient>
      </Reveal>
      <Reveal at={0.9} from="up" sfx="sparkle">
        <Gradient size={130} colors={[C.yellow, C.pink]}>
          DEBUGGING
        </Gradient>
      </Reveal>
      <Reveal at={stuck} sfx="boom">
        <Pill color={C.red} size={52} style={{ color: "#fff", rotate: `${Math.sin(t * 12) * 3}deg` }}>
          most devs are stuck at 2 😬
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- INTRO ---------------- */
const CHIPS: [string, string][] = [
  ["React", C.cyan],
  ["Node", C.green],
  ["SQL", C.yellow],
  ["Docker", C.purple],
];

export const Intro: React.FC = () => {
  const id = "intro";
  const { frame } = useT();
  const show = at(id, 1);
  return (
    <Stage
      id={id}
      accent={C.cyan}
      moves={{
        keys: [
          { t: 0, x: -300, mood: "happy" },
          { t: 0.9, x: 0, armR: -150 },
          { t: show, armR: -150, mood: "wink" },
          { t: show + 0.4, armR: -70, armL: 6, lookX: 0, mood: "excited" },
        ],
        sways: [{ from: 0.9, to: 2.6, hz: 2.5, armR: 28, headRot: 4 }],
        hops: [{ t: show, h: 70 }],
      }}
    >
      <Reveal at={0.2} from="left">
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff" }}>Hi, I'm 👋</div>
      </Reveal>
      <Reveal at={0.45} sfx="sparkle">
        <Gradient size={180} colors={[C.cyan, C.pink]}>
          CHANDRA
        </Gradient>
      </Reveal>
      <Reveal at={1.4} from="up">
        <Pill color={C.yellow} size={54}>
          10 YRS · FULL STACK DEV
        </Pill>
      </Reveal>
      <div style={{ display: "flex", gap: 22 }}>
        {CHIPS.map(([name, color], i) => (
          <Reveal key={name} at={1.9 + i * 0.18}>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: 40,
                color,
                border: `4px solid ${color}`,
                borderRadius: 20,
                padding: "10px 22px",
                translate: `0 ${Math.sin(frame / 8 + i) * 8}px`,
              }}
            >
              {name}
            </div>
          </Reveal>
        ))}
      </div>
    </Stage>
  );
};

/* ---------------- LEVEL 1: console.log ---------------- */
export const L1: React.FC = () => {
  const id = "l1";
  const { frame } = useT();
  const l2 = at(id, 1);
  const please = l2 + 1.0;
  const rows: [string, string, number][] = [
    ['console.log("here")', "here", 0.9],
    ['console.log("here2")', "here2", l2],
    ['console.log("HERE PLEASE")', "HERE PLEASE", please],
  ];
  return (
    <Stage
      id={id}
      accent={C.yellow}
      level={1}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy", armL: -25, armR: 25 },
          { t: l2, mood: "tired", lookY: -1 },
          { t: please, mood: "dizzy", armL: 40, armR: -40 },
        ],
        sways: [
          { from: 0.6, to: please, hz: 7, armL: 8, armR: -8 },
          { from: please, to: please + 1.6, hz: 1.4, lean: 6, headRot: 10 },
        ],
      }}
      shake={[[please, please + 0.4]]}
    >
      <LevelBadge n={1} label="console.log" color={C.yellow} />
      <Reveal at={0.5} from="up" sfx={null}>
        <Card title="debug.js" accent={C.yellow}>
          {rows.map(([code, out, from], i) => (
            <div key={code} style={{ fontFamily: MONO, fontSize: 38, lineHeight: 1.6 }}>
              <Type text={code} from={from} style={{ color: "#E6EDF7" }} />
              {frame / 30 > from + code.length / 22 + 0.1 && (
                <div
                  style={{
                    color: i === 2 ? C.red : C.green,
                    fontWeight: 800,
                    fontSize: i === 2 ? 64 : 38,
                    rotate: i === 2 ? `${Math.sin(frame * 1.3) * 2}deg` : undefined,
                  }}
                >
                  {"> "}
                  {out}
                  {i === 2 ? " 😭" : ""}
                </div>
              )}
            </div>
          ))}
        </Card>
      </Reveal>
      <Sound at={0.9} sfx="typing" seconds={please + 1.2 - 0.9} />
      <Sound at={please + 1.2} sfx="boing" />
    </Stage>
  );
};

/* ---------------- LEVEL 2: the debugger ---------------- */
const CODE = ["function getUser(id) {", "  const user = db.find(id);", "  return user.profile;", "}"];

export const L2: React.FC = () => {
  const id = "l2";
  const { frame } = useT();
  const panic = at(id, 1, 1.0);
  const back = at(id, 2, 0.9);
  return (
    <Stage
      id={id}
      accent={C.red}
      level={2}
      moves={{
        keys: [
          { t: 0, x: 200, mood: "think", lookX: -1, armR: -6 },
          { t: 0.8, x: 160, armL: -30 },
          { t: panic, mood: "wow", armL: 140, armR: -140 },
          { t: back, mood: "sad", armL: 45, armR: -45, x: 0 },
          { t: back + 1, mood: "laugh" },
        ],
        sways: [{ from: panic, to: back - 0.2, hz: 4, headRot: 14, x: 20 }],
        hops: [{ t: panic, h: 60 }],
      }}
      shake={[[panic, panic + 0.6]]}
    >
      <LevelBadge n={2} label="the debugger" color={C.red} />
      <Reveal at={0.4} from="up">
        <Card title="user.js" accent={C.red}>
          {CODE.map((line, i) => {
            const bp = i === 1;
            return (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontFamily: MONO,
                  fontSize: 36,
                  lineHeight: 1.7,
                  color: "#E6EDF7",
                  background: bp && frame / 30 > at(id, 1) ? "rgba(255,89,100,0.18)" : undefined,
                  borderRadius: 10,
                }}
              >
                <span style={{ color: "#56607A", width: 30 }}>{i + 1}</span>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    background: bp && frame / 30 > at(id, 1) ? C.red : "transparent",
                    boxShadow: bp ? `0 0 ${12 + Math.sin(frame / 4) * 10}px ${C.red}` : undefined,
                  }}
                />
                <span style={{ whiteSpace: "pre" }}>{line}</span>
              </div>
            );
          })}
        </Card>
      </Reveal>
      <Sound at={at(id, 1)} sfx="pop" />
      <Reveal at={panic} sfx="boom" style={{ position: "absolute", top: 300, rotate: "-8deg" }}>
        <Gradient size={190} colors={[C.red, C.yellow]} style={{ opacity: frame / 30 > back ? 0.15 : 1 }}>
          PANIC!
        </Gradient>
      </Reveal>
      <Reveal at={back} from="right" sfx="boing" style={{ position: "absolute", bottom: 20 }}>
        <Pill color={C.green} size={50}>
          back to console.log() 🫶
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 3: rubber duck ---------------- */
const Duck: React.FC<{ frame: number; happy: boolean }> = ({ frame, happy }) => (
  <svg viewBox="0 0 200 180" width={250}>
    <ellipse cx={100} cy={170} rx={80} ry={8} fill="rgba(0,0,0,0.35)" />
    <g transform={`translate(0 ${-Math.abs(Math.sin(frame / 6)) * (happy ? 18 : 5)}) rotate(${Math.sin(frame / 10) * 5} 100 150)`}>
      <ellipse cx={100} cy={120} rx={82} ry={46} fill="#FFD43B" stroke="#E0A800" strokeWidth={4} />
      <path d="M150,110 Q190,100 184,70" stroke="#E0A800" strokeWidth={4} fill="#FFD43B" />
      <circle cx={70} cy={66} r={44} fill="#FFD43B" stroke="#E0A800" strokeWidth={4} />
      <path d="M26,70 Q6,76 14,88 Q32,92 40,80 Z" fill="#FF8C1A" />
      <circle cx={58} cy={58} r={7} fill="#1B1B1B" />
      <circle cx={60} cy={56} r={2.5} fill="#fff" />
      <path d="M100,118 Q120,140 140,118" stroke="#E0A800" strokeWidth={4} fill="none" />
    </g>
  </svg>
);

export const L3: React.FC = () => {
  const id = "l3";
  const { frame, t } = useT();
  const fixed = at(id, 2, 1.2);
  return (
    <Stage
      id={id}
      accent={C.yellow}
      level={3}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy" },
          { t: 0.9, x: -190, lookX: 1, armR: -60 },
          { t: at(id, 1), mood: "think", armR: -80 },
          { t: fixed, mood: "excited", armL: 150, armR: -150 },
          { t: fixed + 0.8, mood: "laugh", armL: 30, armR: -30 },
        ],
        sways: [{ from: at(id, 1), to: fixed, hz: 2, armR: 30, armL: 10 }],
        hops: [
          { t: fixed, h: 90 },
          { t: fixed + 0.6, h: 50 },
        ],
      }}
      under={
        <div style={{ position: "absolute", right: 70, bottom: 40 }}>
          <Duck frame={frame} happy={t > fixed} />
        </div>
      }
    >
      <LevelBadge n={3} label="rubber duck 🦆" color={C.yellow} />
      <Reveal at={at(id, 1)} from="left">
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 46,
            color: "#0E1424",
            background: "#fff",
            borderRadius: 36,
            padding: "26px 36px",
            maxWidth: 820,
            boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
          }}
        >
          <Type text={'"So the loop runs, then it calls... oh."'} from={at(id, 1, 0.2)} cps={18} />
        </div>
      </Reveal>
      <Sound at={at(id, 1, 0.2)} sfx="typing" seconds={2.3} />
      <Reveal at={fixed} sfx="ding">
        <Pill color={C.green} size={80}>
          FIXED ✅
        </Pill>
      </Reveal>
      <Confetti at={fixed} />
    </Stage>
  );
};

/* ---------------- LEVEL 4: read the error ---------------- */
export const L4: React.FC = () => {
  const id = "l4";
  const { frame, t } = useT();
  const allOfIt = at(id, 0, 1.9);
  const told = at(id, 1, 1.2);
  const scan = interpolate(t, [allOfIt - 0.3, allOfIt + 1.0], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage
      id={id}
      accent={C.red}
      level={4}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "tired" },
          { t: allOfIt - 0.3, mood: "think", lookY: -1, armR: -100 },
          { t: told, mood: "wow", armR: -6, armL: 6, lookY: 0 },
          { t: told + 1.0, mood: "laugh", armR: -150 },
        ],
        sways: [{ from: allOfIt, to: told, hz: 0.8, x: 60, headRot: 6 }],
        hops: [{ t: told, h: 60 }],
      }}
    >
      <LevelBadge n={4} label="read the error" color={C.red} />
      <Reveal at={0.4} from="up">
        <Card title="terminal" accent={C.red}>
          <div style={{ position: "relative", fontFamily: MONO, fontSize: 36, lineHeight: 1.5, color: "#FF9AA2" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: `${scan}%`,
                background: "rgba(255,200,87,0.22)",
                borderRight: scan > 0 && scan < 100 ? `6px solid ${C.yellow}` : undefined,
              }}
            />
            <div style={{ fontWeight: 800 }}>TypeError:</div>
            <div>Cannot read properties of</div>
            <div>undefined (reading 'name')</div>
            <div style={{ color: "#9AA7C7" }}>
              {"  at "}
              <span
                style={{
                  color: t > told ? C.yellow : "#9AA7C7",
                  fontWeight: t > told ? 800 : 400,
                  textDecoration: t > told ? "underline" : undefined,
                }}
              >
                profile.js:42
              </span>
            </div>
          </div>
        </Card>
      </Reveal>
      <Reveal at={allOfIt} sfx="pop">
        <Pill color={C.yellow} size={46}>
          ALL. OF. IT. 👀
        </Pill>
      </Reveal>
      <Reveal at={told} sfx="ding" style={{ rotate: `${-4 + Math.sin(frame / 10) * 2}deg` }}>
        <Pill color={C.green} size={56}>
          it literally told you 🙃
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 5: git bisect ---------------- */
const COMMITS = 9;
const BAD = 6; // index of the commit that broke everything

export const L5: React.FC = () => {
  const id = "l5";
  const { frame, t, fps } = useT();
  // Binary search: look at the middle, then narrow down.
  const probes = [4, 6, 5, BAD];
  const s0 = at(id, 1);
  const step = 0.55;
  const found = s0 + step * probes.length;
  const probeIdx = Math.min(probes.length - 1, Math.max(0, Math.floor((t - s0) / step)));
  const searching = t >= s0;
  const ptr = probes[probeIdx];
  return (
    <Stage
      id={id}
      accent={C.purple}
      level={5}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy" },
          { t: s0, mood: "think", x: -120, lookX: 1 },
          { t: s0 + step * 2, x: 120, lookX: -1 },
          { t: found, x: 60, mood: "wow", armR: -140 },
          { t: found + 0.9, mood: "laugh", armR: -60, armL: 60 },
        ],
        hops: probes.map((_, i) => ({ t: s0 + i * step, h: 35, d: 0.35 })),
      }}
      shake={[[found, found + 0.3]]}
    >
      <LevelBadge n={5} label="git bisect" color={C.purple} />
      <Reveal at={0.5} from="up">
        <div style={{ position: "relative", width: 900, height: 260 }}>
          <div style={{ position: "absolute", top: 120, left: 40, right: 40, height: 10, borderRadius: 5, background: "#2E3A5C" }} />
          {Array.from({ length: COMMITS }).map((_, i) => {
            const isBad = i === BAD && t > found;
            const color = i < 4 && t > s0 + step ? C.green : i > BAD && t > s0 + step * 2 ? C.red : isBad ? C.red : "#8B95B5";
            const pop = isBad ? spring({ frame: frame - Math.round(found * fps), fps, config: { damping: 8 } }) : 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 125 - 28 - pop * 16,
                  left: 40 + (i * 820) / (COMMITS - 1) - 28 - pop * 16,
                  width: 56 + pop * 32,
                  height: 56 + pop * 32,
                  borderRadius: 50,
                  background: color,
                  border: "6px solid #0E1424",
                  boxShadow: isBad ? `0 0 40px ${C.red}` : undefined,
                }}
              />
            );
          })}
          {searching && (
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 40 + (ptr * 820) / (COMMITS - 1) - 30,
                fontSize: 60,
              }}
            >
              🔍
            </div>
          )}
          {t > found && (
            <div style={{ position: "absolute", top: 190, left: 40 + (BAD * 820) / (COMMITS - 1) - 230, width: 460, textAlign: "center", fontFamily: MONO, fontSize: 34, color: C.red, fontWeight: 800 }}>
              a1b2c3 "quick fix"
            </div>
          )}
        </div>
      </Reveal>
      {probes.map((p, i) => (
        <Sound key={p + "-" + i} at={s0 + i * step} sfx="pop" volume={0.25} />
      ))}
      <Reveal at={found} sfx="boom">
        <Pill color={C.red} size={60} style={{ color: "#fff" }}>
          it was past-you 😈
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 6: take a walk ---------------- */
export const L6: React.FC = () => {
  const id = "l6";
  const { frame, t, fps } = useT();
  const shower = at(id, 1, 0.9);
  const idea = at(id, 1, 1.8);
  const bulb = spring({ frame: frame - Math.round(idea * fps), fps, config: { damping: 7 } });
  return (
    <Stage
      id={id}
      accent={C.cyan}
      level={6}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "tired" },
          { t: 0.6, x: 0, mood: "happy" },
          { t: 1.9, x: -250 },
          { t: 3.0, x: 250, lookX: 1 },
          { t: idea, x: 150, mood: "wow", armL: 160, armR: -160 },
          { t: idea + 0.7, x: 150, mood: "excited", armL: 40, armR: -40 },
        ],
        hops: [{ t: idea, h: 90 }],
      }}
    >
      <LevelBadge n={6} label="take a walk" color={C.cyan} />
      <div style={{ position: "relative", width: 900, height: 420, display: "flex", justifyContent: "center" }}>
        <Reveal at={shower - 0.6} from="up" style={{ position: "absolute", left: 120, top: 0 }}>
          <div style={{ fontSize: 170 }}>🚿</div>
        </Reveal>
        {t > shower &&
          Array.from({ length: 12 }).map((_, i) => {
            const y = ((frame * 14 + i * 37) % 260) + 150;
            return (
              <div
                key={i}
                style={{ position: "absolute", left: 140 + (i % 6) * 26 + (i > 5 ? 12 : 0), top: y, width: 10, height: 26, borderRadius: 6, background: C.cyan, opacity: 0.8 }}
              />
            );
          })}
        {t > idea && (
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 20,
              fontSize: 190,
              scale: String(bulb),
              filter: `drop-shadow(0 0 ${40 + Math.sin(frame / 3) * 20}px ${C.yellow})`,
            }}
          >
            💡
          </div>
        )}
        <Reveal at={idea + 0.3} style={{ position: "absolute", right: 70, top: 260 }}>
          <Pill color={C.yellow} size={50}>
            THE FIX!
          </Pill>
        </Reveal>
      </div>
      <Reveal at={shower} from="up">
        <Pill color={C.cyan} size={44}>
          ⏱ 20 min later
        </Pill>
      </Reveal>
      <Sound at={idea} sfx="ding" />
    </Stage>
  );
};

/* ---------------- LEVEL 7: it fixes itself ---------------- */
export const L7: React.FC = () => {
  const id = "l7";
  const { frame, t } = useT();
  const fixes = at(id, 1, 0.3);
  const never = at(id, 2, 1.0);
  const bugGone = interpolate(t, [fixes, fixes + 0.6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glitch = frame % 23 < 3 ? 12 : 0;
  return (
    <Stage
      id={id}
      accent={C.purple}
      dark
      level={7}
      moves={{
        keys: [
          { t: 0, x: -200, mood: "think", lookX: 1, armR: -6 },
          { t: 1.0, x: -160 },
          { t: fixes, mood: "wow", armL: 120, armR: -120 },
          { t: never - 0.4, mood: "dizzy", armL: 30, armR: -30, x: -60 },
          { t: never + 0.4, mood: "laugh", armR: -160 },
        ],
        sways: [
          { from: 0.4, to: fixes, hz: 0.6, lean: 3 },
          { from: never - 0.4, to: never + 0.4, hz: 2, headRot: 12 },
        ],
        hops: [{ t: fixes, h: 70 }],
      }}
      shake={[[never, never + 0.35]]}
    >
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, translate: `${glitch}px 0`, opacity: 0.7 }}>
          <Gradient size={140} colors={[C.red, C.red]}>
            LEVEL 7
          </Gradient>
        </div>
        <div style={{ position: "absolute", inset: 0, translate: `${-glitch}px 0`, opacity: 0.7 }}>
          <Gradient size={140} colors={[C.cyan, C.cyan]}>
            LEVEL 7
          </Gradient>
        </div>
        <Gradient size={140} colors={["#fff", C.purple]}>
          LEVEL 7
        </Gradient>
      </div>
      <div style={{ height: 230, display: "flex", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 190,
            opacity: bugGone,
            scale: String(0.4 + 0.6 * bugGone),
            rotate: `${Math.sin(frame / 5) * 10}deg`,
          }}
        >
          🐛
        </div>
        <Reveal at={fixes} sfx="sparkle" style={{ position: "absolute" }}>
          <Pill color={C.green} size={64}>
            ✨ it works?!
          </Pill>
        </Reveal>
      </div>
      <Reveal at={never} sfx="boom" from="left">
        <div
          style={{
            width: 1200,
            rotate: "-6deg",
            padding: "22px 0",
            background: `repeating-linear-gradient(45deg, ${C.yellow} 0 50px, #111 50px 100px)`,
            boxShadow: "0 12px 0 rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <span style={{ background: "#111", color: C.yellow, fontFamily: FONT, fontWeight: 900, fontSize: 70, padding: "6px 30px" }}>
            DON'T. TOUCH. IT.
          </span>
        </div>
      </Reveal>
      <Sound at={end(id, 2, -0.2)} sfx="boing" />
    </Stage>
  );
};

/* ---------------- CTA ---------------- */
export const CTA: React.FC = () => {
  const id = "cta";
  const { frame } = useT();
  return (
    <Stage
      id={id}
      accent={C.pink}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "wink", armR: -150 },
          { t: 0.8, armR: -60, mood: "excited" },
          { t: at(id, 1), mood: "wink", armR: -150 },
        ],
        sways: [{ from: 0, to: 0.8, hz: 3, armR: 25 }],
        hops: [{ t: at(id, 1), h: 70 }],
      }}
    >
      <Reveal at={0.05} from="up" sfx="sparkle">
        <Gradient size={120} colors={[C.yellow, C.pink]}>
          WHICH LEVEL
        </Gradient>
        <Gradient size={120} colors={[C.cyan, C.purple]}>
          ARE YOU?
        </Gradient>
      </Reveal>
      <div style={{ display: "flex", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
          <Reveal key={n} at={0.3 + i * 0.09} sfx={i % 2 ? null : "pop"}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 26,
                background: [C.yellow, C.red, C.yellow, C.red, C.purple, C.cyan, C.purple][i],
                color: "#0E1424",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                translate: `0 ${Math.sin(frame / 6 + i) * 10}px`,
                boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
              }}
            >
              {n}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal at={at(id, 1)} from="up">
        <Pill color="#fff" size={48} style={{ whiteSpace: "nowrap" }}>
          💬 comment below · be honest 👇
        </Pill>
      </Reveal>
      <Confetti at={at(id, 1)} />
    </Stage>
  );
};
