import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { at, Big, C, Card, end, FONT, LevelTag, MONO, Pill, Rank, Reveal, Sound, Stage } from "./kit";

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

// Typewriter text: shows `text` letter by letter from `from` seconds.
const Type: React.FC<{ text: string; from: number; cps?: number; style?: React.CSSProperties }> = ({
  text,
  from,
  cps = 30,
  style,
}) => {
  const { t, frame } = useT();
  if (t < from) return null;
  const n = Math.min(text.length, Math.floor((t - from) * cps));
  const caret = n < text.length || Math.floor(frame / 12) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {caret && <span style={{ color: C.cyan }}>▍</span>}
    </span>
  );
};

/* ---------------- HOOK: premise first, tease Level 7 ---------------- */
const HOOK_WORDS = ["THERE", "ARE", "7 LEVELS", "OF", "DEBUGGING."];

export const Hook: React.FC = () => {
  const id = "hook";
  const { t } = useT();
  // LEVEL 1..7 counter flips in the pause between the two lines.
  const flipStart = end(id, 0, 0.02);
  const flipStep = (at(id, 1) - flipStart) / 7;
  const flipping = t >= flipStart;
  const lvl = Math.min(7, 1 + Math.floor((t - flipStart) / flipStep));
  const danger = at(id, 1, 1.25);
  return (
    <Stage
      id={id}
      moves={{
        keys: [
          { t: 0, x: 230, mood: "happy", armR: -6 },
          { t: at(id, 1), mood: "think", lookX: -0.6, lookY: -1 },
          { t: danger, mood: "wow", armL: 30, armR: -30 },
        ],
      }}
      punches={[flipStart, at(id, 1), danger]}
    >
      {!flipping && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0 26px", width: 900 }}>
          {HOOK_WORDS.map((w, i) => (
            <Reveal key={w} at={0.05 + i * 0.3} from="up">
              <Big size={w === "7 LEVELS" ? 150 : 110} color={w === "7 LEVELS" ? C.yellow : "#fff"}>
                {w}
              </Big>
            </Reveal>
          ))}
        </div>
      )}
      {flipping && (
        <>
          <Big size={200} color={lvl === 7 ? C.red : "#fff"}>
            LEVEL {lvl}
          </Big>
          <Reveal at={at(id, 1, 0.3)} from="up">
            <Big size={70}>is where things get</Big>
          </Reveal>
          <Reveal at={danger} sfx="impact">
            <Pill color={C.red} size={90} style={{ color: "#fff", rotate: "-3deg" }}>
              DANGEROUS.
            </Pill>
          </Reveal>
        </>
      )}
      {Array.from({ length: 7 }).map((_, i) => (
        <Sound key={i} at={flipStart + i * flipStep} sfx="tick" />
      ))}
    </Stage>
  );
};

/* ---------------- INTRO: under 2 seconds ---------------- */
export const Intro: React.FC = () => {
  const id = "intro";
  return (
    <Stage
      id={id}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy", armR: -150 },
          { t: 1.2, armR: -10, mood: "wink" },
        ],
        sways: [{ from: 0, to: 1.1, hz: 3, armR: 22 }],
      }}
    >
      <Reveal at={0.1} from="up">
        <Pill color={C.yellow} size={56}>
          @chandratech92
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 1: console.log (normal pace) ---------------- */
export const L1: React.FC = () => {
  const id = "l1";
  const { frame } = useT();
  const l2 = at(id, 1);
  const outs: [string, number][] = [
    ["here", l2],
    ["here2", l2 + 0.42],
    ["HERE PLEASE", l2 + 0.9],
  ];
  const please = outs[2][1];
  return (
    <Stage
      id={id}
      level={1}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy", armL: -22, armR: 22, lookY: -1 },
          { t: please, mood: "tired", armL: 6, armR: -6 },
        ],
        sways: [{ from: 0.2, to: l2, hz: 7, armL: 6, armR: -6 }],
      }}
      punches={[please]}
    >
      <LevelTag n={1} label="console.log()" color={C.yellow} />
      <Rank at={1.0} color={C.dim}>
        NORMAL DEV
      </Rank>
      <Card title="debug.js" accent={C.yellow}>
        <div style={{ fontFamily: MONO, fontSize: 38, lineHeight: 1.6, color: "#E6EDF7", height: 320 }}>
          <Type text={'console.log("here")'} from={0.25} cps={40} />
          {outs.map(([o, t0], i) => (
            <Reveal key={o} at={t0} sfx="pop" from="left">
              <div
                style={{
                  color: i === 2 ? C.red : C.green,
                  fontWeight: 800,
                  fontSize: i === 2 ? 70 : 38,
                  rotate: i === 2 ? `${Math.sin(frame * 1.1) * 1.5}deg` : undefined,
                }}
              >
                {"> "}
                {o}
              </div>
            </Reveal>
          ))}
        </div>
      </Card>
      <Sound at={0.25} sfx="key" seconds={0.6} />
    </Stage>
  );
};

/* ---------------- LEVEL 2: debugger, step by step ---------------- */
const CODE = ["function getUser(id) {", "  const user = db.find(id);", "  return user.profile;", "}"];

export const L2: React.FC = () => {
  const id = "l2";
  const { frame, fps, t } = useT();
  const cursorIn = 0.35;
  const bp = 0.95; // click: breakpoint set
  const stepAt = [at(id, 1, 0.05), at(id, 1, 0.4), at(id, 1, 0.75)];
  const reveal = end(id, 1, -0.45); // "undefined"
  const back = at(id, 2);
  const curLine = t >= stepAt[2] ? 2 : t >= stepAt[1] ? 1 : t >= stepAt[0] ? 0 : -1;
  const cursorX = interpolate(t, [cursorIn, bp - 0.1], [860, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(t, [cursorIn, bp - 0.1], [400, 118], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const varP = t >= reveal ? spring({ frame: frame - Math.round(reveal * fps), fps, config: { damping: 12, stiffness: 260 } }) : 0;
  return (
    <Stage
      id={id}
      level={2}
      moves={{
        keys: [
          { t: 0, x: 210, mood: "think", lookX: -1, lookY: -1 },
          { t: reveal, mood: "wow" },
          { t: back, mood: "sad", armL: 40, armR: -40, lookX: 0, lookY: 0 },
        ],
      }}
      punches={[bp, reveal]}
      shake={[[reveal, reveal + 0.2]]}
    >
      <LevelTag n={2} label="the debugger" color={C.cyan} />
      <Rank at={1.3} color={C.cyan}>
        PROFESSIONAL DEV
      </Rank>
      <div style={{ position: "relative" }}>
        <Card title="user.js" accent={C.cyan}>
          {CODE.map((line, i) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: MONO,
                fontSize: 34,
                lineHeight: 1.75,
                color: "#E6EDF7",
                background: curLine === i ? "rgba(76,201,240,0.18)" : undefined,
                borderRadius: 8,
              }}
            >
              <span style={{ color: "#56607A", width: 26 }}>{i + 1}</span>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: i === 1 && t >= bp ? C.red : "transparent" }} />
              <span style={{ whiteSpace: "pre" }}>{line}</span>
            </div>
          ))}
          {/* variables panel expands to show the culprit */}
          <div
            style={{
              marginTop: 14 * varP,
              height: 80 * varP,
              overflow: "hidden",
              fontFamily: MONO,
              fontSize: 40,
              borderTop: varP > 0 ? "2px solid #2A3350" : undefined,
              paddingTop: 12 * varP,
              color: C.dim,
            }}
          >
            ▾ user ={" "}
            <span style={{ color: C.red, fontWeight: 800, background: "rgba(255,89,100,0.15)", padding: "0 10px", borderRadius: 8 }}>
              undefined
            </span>
          </div>
        </Card>
        {t >= cursorIn && t < stepAt[0] && (
          <svg width={44} height={56} viewBox="0 0 22 28" style={{ position: "absolute", left: cursorX, top: cursorY }}>
            <path d="M2,2 L2,24 L8,18 L12,27 L16,25 L12,16 L20,16 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
          </svg>
        )}
      </div>
      <Sound at={bp} sfx="click" />
      {stepAt.map((s) => (
        <Sound key={s} at={s} sfx="tick" />
      ))}
      <Sound at={reveal} sfx="impact" volume={0.3} />
      <Reveal at={back} from="left" style={{ position: "absolute", bottom: -40, left: 0, rotate: "-4deg" }}>
        <Pill color={C.yellow} size={50}>
          back to console.log() 😭
        </Pill>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 3: rubber duck (faster) ---------------- */
const Duck: React.FC<{ frame: number; talking: boolean }> = ({ frame, talking }) => (
  <svg viewBox="0 0 200 180" width={230}>
    <ellipse cx={100} cy={170} rx={76} ry={7} fill="rgba(0,0,0,0.35)" />
    <g transform={`translate(0 ${talking ? -Math.abs(Math.sin(frame / 3)) * 6 : 0})`}>
      <ellipse cx={100} cy={120} rx={82} ry={46} fill="#FFD43B" />
      <path d="M150,110 Q190,100 184,70" fill="#FFD43B" />
      <circle cx={70} cy={66} r={44} fill="#FFD43B" />
      <path d="M26,70 Q6,76 14,88 Q32,92 40,80 Z" fill="#FF8C1A" />
      <circle cx={58} cy={58} r={7} fill="#1B1B1B" />
      <circle cx={60} cy={56} r={2.5} fill="#fff" />
      <path d="M100,118 Q120,140 140,118" stroke="#E0A800" strokeWidth={4} fill="none" />
    </g>
  </svg>
);

export const L3: React.FC = () => {
  const id = "l3";
  const { frame, fps, t } = useT();
  const duckIn = 0.3;
  const fixed = end(id, 1, -0.5);
  const duckX = interpolate(spring({ frame: frame - Math.round(duckIn * fps), fps, config: { damping: 14 } }), [0, 1], [400, 0]);
  return (
    <Stage
      id={id}
      level={3}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "happy" },
          { t: 0.9, x: -190, lookX: 1, armR: -50 },
          { t: at(id, 1), mood: "think", armR: -70 },
          { t: fixed, mood: "excited", armL: 120, armR: -120 },
        ],
        sways: [{ from: at(id, 1), to: fixed, hz: 2.2, armR: 22 }],
        hops: [{ t: fixed, h: 40 }],
      }}
      punches={[fixed]}
      under={
        <div style={{ position: "absolute", right: 60, bottom: 40, translate: `${duckX}px 0` }}>
          <Duck frame={frame} talking={t > fixed && t < fixed + 0.5} />
        </div>
      }
    >
      <LevelTag n={3} label="rubber duck" color={C.green} />
      <Rank at={1.0} color={C.green}>
        SENIOR DEV
      </Rank>
      <Sound at={duckIn + 0.15} sfx="quack" />
      <Reveal at={at(id, 1)} from="up">
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 46,
            color: C.bg,
            background: "#fff",
            borderRadius: 32,
            padding: "24px 34px",
            maxWidth: 820,
          }}
        >
          <Type text={'"So it loops, then it calls— oh."'} from={at(id, 1, 0.1)} cps={24} />
        </div>
      </Reveal>
      <Reveal at={fixed} sfx="ding">
        <Pill color={C.green} size={64}>
          ✓ FIXED
        </Pill>
      </Reveal>
      <Sound at={fixed + 0.25} sfx="quack" volume={0.12} />
    </Stage>
  );
};

/* ---------------- LEVEL 4: read the error (noticeably faster) ---------------- */
export const L4: React.FC = () => {
  const id = "l4";
  const { t, frame, fps } = useT();
  const typeErr = 0.2;
  const msg = 0.65;
  const hl = 1.15;
  const where = 1.5;
  const told = at(id, 1);
  const hlP = t >= hl ? spring({ frame: frame - Math.round(hl * fps), fps, config: { damping: 10, stiffness: 260 } }) : 0;
  return (
    <Stage
      id={id}
      level={4}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "tired", lookY: -1, lean: -4 },
          { t: told, mood: "wow", lean: 0 },
          { t: told + 0.6, mood: "laugh" },
        ],
      }}
      punches={[typeErr, hl, told]}
    >
      <LevelTag n={4} label="read the error" color={C.pink} />
      <Rank at={told + 0.45} color={C.pink}>
        PRINCIPAL ENGINEER
      </Rank>
      <div style={{ height: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <Reveal at={typeErr} sfx="error">
          <Big size={130} color={C.red} style={{ fontFamily: MONO, letterSpacing: -4 }}>
            TypeError
          </Big>
        </Reveal>
        <Reveal at={msg} from="up">
          <div style={{ fontFamily: MONO, fontSize: 44, color: "#E6EDF7", textAlign: "center", lineHeight: 1.35 }}>
            Cannot read properties of{" "}
            <span
              style={{
                display: "inline-block",
                color: t >= hl ? C.bg : "#E6EDF7",
                background: t >= hl ? C.yellow : "transparent",
                borderRadius: 10,
                padding: "0 12px",
                scale: String(1 + 0.25 * hlP),
                fontWeight: 800,
              }}
            >
              undefined
            </span>
          </div>
        </Reveal>
        <Reveal at={where} from="up">
          <div style={{ fontFamily: MONO, fontSize: 40, color: C.dim }}>
            at <span style={{ color: t >= told ? C.green : C.dim, fontWeight: 800 }}>profile.js:42</span>
            {t >= told && <span style={{ color: C.green, fontWeight: 800 }}> ← it told you</span>}
          </div>
        </Reveal>
      </div>
      <Sound at={hl} sfx="pop" />
      <Sound at={told} sfx="ding" />
    </Stage>
  );
};

/* ---------------- LEVEL 5: git bisect (fast) ---------------- */
const COMMITS = ["f00d", "c0de", "beef", "a1b2", "d00m", "cafe", "babe"];
const BAD = 3;

export const L5: React.FC = () => {
  const id = "l5";
  const { t, frame } = useT();
  const s0 = 0.55;
  const step = 0.3;
  const probes = [3, 5, 1, BAD]; // binary-search jumps
  const found = s0 + step * probes.length;
  const pi = Math.min(probes.length - 1, Math.floor((t - s0) / step));
  const ptr = t >= s0 ? probes[pi] : -1;
  const slide = interpolate(t, [0, 0.4], [700, 0], { extrapolateRight: "clamp" });
  return (
    <Stage
      id={id}
      level={5}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "think" },
          ...probes.map((p, i) => ({ t: s0 + i * step, lookX: (p - 3) / 3, headRot: (p - 3) * 3 })),
          { t: found, mood: "laugh", armR: -140, lookX: 0, headRot: 0 },
        ],
      }}
      punches={[found]}
    >
      <LevelTag n={5} label="git bisect" color={C.purple} />
      <Rank at={found + 0.35} color={C.purple}>
        WIZARD 🧙
      </Rank>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, translate: `${slide}px 0` }}>
        {COMMITS.map((c, i) => {
          const isPtr = ptr === i;
          const bad = t >= found && i === BAD;
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontFamily: MONO,
                fontSize: 36,
                padding: "4px 20px",
                width: 700,
                borderRadius: 12,
                color: bad ? C.bg : isPtr ? "#fff" : C.dim,
                background: bad ? C.red : isPtr ? "rgba(167,139,250,0.3)" : "transparent",
                translate: isPtr && !bad ? `${Math.sin(frame) * 3}px 0` : undefined,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: bad ? C.bg : i < BAD ? C.green : C.red,
                  opacity: t > s0 + step ? 1 : 0.3,
                }}
              />
              {c}
              <span style={{ fontSize: 30 }}>{bad ? '"quick fix" ← past-you' : i === BAD ? '"quick fix"' : "wip"}</span>
            </div>
          );
        })}
      </div>
      {probes.map((p, i) => (
        <Sound key={`${p}${i}`} at={s0 + i * step} sfx="tick" />
      ))}
      <Sound at={found} sfx="impact" volume={0.3} />
    </Stage>
  );
};

/* ---------------- LEVEL 6: literally walk out of frame ---------------- */
export const L6: React.FC = () => {
  const id = "l6";
  const walkOut = 0.25;
  const gone = 1.2;
  const shower = at(id, 1);
  return (
    <Stage
      id={id}
      level={6}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "tired" },
          { t: walkOut, x: 0, mood: "happy" },
          { t: gone, x: 820 },
        ],
      }}
      punches={[shower]}
    >
      <LevelTag n={6} label="take a walk" color={C.yellow} />
      <Sound at={walkOut} sfx="steps" />
      <Rank at={gone} color={C.yellow}>
        THERAPY
      </Rank>
      <Reveal at={shower} sfx="pop">
        <div style={{ fontSize: 200, lineHeight: 1 }}>🚿</div>
      </Reveal>
    </Stage>
  );
};

/* ---------------- LEVEL 7: slow down. Silence is the joke ---------------- */
const WORKING = ["function getUser(id) {", "  return magic(id);", "}"];

export const L7: React.FC = () => {
  const id = "l7";
  const { t } = useT();
  const works = at(id, 1);
  const why = at(id, 2);
  const dnt = at(id, 3);
  const words = ["DO.", "NOT.", "TOUCH.", "IT."];
  // "Do. Not. Touch. It." is spoken evenly; pace the words to the audio.
  const wStep = (end(id, 3) - dnt) / 4;
  return (
    <Stage
      id={id}
      dark
      still
      moves={{
        // walks back in, stops, and just stares
        keys: [
          { t: 0, x: -700, mood: "happy", lookX: 1 },
          { t: 0.9, x: -200, lookX: 1, lookY: -1 },
          { t: 1.0, mood: "think" },
          { t: works, mood: "wow" },
          { t: why, mood: "think" },
          { t: dnt, mood: "wow", lookX: 0, lookY: 0 },
        ],
      }}
      punches={[dnt + wStep * 3]}
    >
      {t < dnt && (
        <>
          <Big size={64} color={C.red} style={{ letterSpacing: 8 }}>
            LEVEL 7
          </Big>
          <Card title="user.js" accent="#2A3350">
            {WORKING.map((l) => (
              <div key={l} style={{ fontFamily: MONO, fontSize: 36, lineHeight: 1.7, color: "#E6EDF7", whiteSpace: "pre" }}>
                {l}
              </div>
            ))}
            <div style={{ fontFamily: MONO, fontSize: 36, color: C.green, marginTop: 10, opacity: t >= works ? 1 : 0 }}>
              ✓ all tests passed
            </div>
          </Card>
          <div style={{ height: 120 }}>
            {t >= works && t < why && <Big size={100}>It works.</Big>}
            {t >= why && <Big size={90}>Nobody knows why.</Big>}
          </div>
        </>
      )}
      {t >= dnt && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {words.map((w, i) =>
            t >= dnt + i * wStep ? (
              <Big key={w} size={170} color={i === 3 ? C.red : C.yellow}>
                {w}
              </Big>
            ) : (
              <div key={w} style={{ height: 173 }} />
            ),
          )}
        </div>
      )}
      <Sound at={dnt + wStep * 3} sfx="impact" />
    </Stage>
  );
};

/* ---------------- CTA: make commenting effortless ---------------- */
export const CTA: React.FC = () => {
  const id = "cta";
  const { t, frame } = useT();
  const numsAt = 1.0;
  const drop = at(id, 1);
  // once all numbers are in, a selector hops across them like a picker
  const sel = t > drop ? Math.floor((frame / 5) % 7) : -1;
  return (
    <Stage
      id={id}
      moves={{
        keys: [
          { t: 0, x: 0, mood: "wink", armR: -40 },
          { t: drop, mood: "excited", armR: -150 },
        ],
      }}
      punches={[drop]}
    >
      <Reveal at={0.05} from="up">
        <Big size={90} color={C.yellow}>
          BE HONEST.
        </Big>
      </Reveal>
      <Reveal at={0.55} from="up">
        <Big size={100}>
          WHAT LEVEL
          <br />
          ARE YOU? 💀
        </Big>
      </Reveal>
      <div style={{ display: "flex", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
          <Reveal key={n} at={numsAt + i * 0.07} sfx="tick">
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 24,
                background: sel === i ? C.yellow : "#141B30",
                border: `3px solid ${n === 7 ? C.red : C.yellow}`,
                color: sel === i ? C.bg : "#fff",
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: sel === i ? "1.12" : "1",
              }}
            >
              {n}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal at={drop} from="up" sfx="pop">
        <Big size={72} color={C.green}>
          DROP THE NUMBER ↓
        </Big>
      </Reveal>
    </Stage>
  );
};
