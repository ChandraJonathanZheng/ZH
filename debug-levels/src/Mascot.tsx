import React from "react";

// Chandra: adult Asian man, short black hair, glasses, black hoodie,
// blue jeans, lean V-taper build. Every body part is its own SVG group
// so the choreography can move it independently.

export type Mood =
  | "happy"
  | "excited"
  | "laugh"
  | "wow"
  | "tired"
  | "sad"
  | "think"
  | "dizzy"
  | "wink";

export type Pose = {
  armL: number; // degrees, + swings out to the left
  armR: number; // degrees, - swings out to the right
  lean: number;
  headRot: number;
  headDip: number;
  lookX: number; // -1..1
  lookY: number; // -1..1
  mood: Mood;
  walking: boolean;
  walkPhase: number; // radians
  bob: number; // px, body bounce
};

const SKIN = "#EBC29B";
const SKIN_DARK = "#C9946C";
const LINE = "#6B3B2A";
const HAIR = "#121212";
const HOODIE = "#17171C";
const HOODIE_DARK = "#0B0B0E";
const JEANS = "#3D72B3";
const JEANS_DARK = "#2C5A93";
const FRAME = "#111";

const Eye: React.FC<{
  cx: number;
  cy: number;
  mood: Mood;
  lookX: number;
  lookY: number;
  blink: number;
  side: "l" | "r";
  frame: number;
}> = ({ cx, cy, mood, lookX, lookY, blink, side, frame }) => {
  const px = cx + lookX * 4;
  const py = cy + lookY * 3;
  if (mood === "laugh" || (mood === "wink" && side === "r")) {
    return (
      <path
        d={`M${cx - 11},${cy + 3} Q${cx},${cy - 10} ${cx + 11},${cy + 3}`}
        stroke={LINE}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (mood === "dizzy") {
    const a = frame * 0.35;
    return (
      <g transform={`rotate(${(a * 180) / Math.PI} ${cx} ${cy})`}>
        <path
          d={`M${cx},${cy} m-2,0 a2,2 0 1,1 4,0 a5,5 0 1,1 -9,0 a8,8 0 1,1 15,0`}
          stroke={LINE}
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }
  const big = mood === "wow" || mood === "excited";
  const ry = (big ? 13 : 10.5) * blink;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={big ? 14 : 12} ry={ry} fill="#fff" />
      {blink > 0.3 && (
        <>
          <circle cx={px} cy={py} r={big ? 8.5 : 6.5} fill="#1B1B1B" />
          <circle cx={px + 2.5} cy={py - 2.5} r={2.2} fill="#fff" />
        </>
      )}
      {mood === "tired" && (
        <rect x={cx - 15} y={cy - 14} width={30} height={13} fill={SKIN} />
      )}
      {mood === "tired" && (
        <line
          x1={cx - 13}
          y1={cy - 1}
          x2={cx + 13}
          y2={cy - 1}
          stroke={LINE}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

const Mouth: React.FC<{ mood: Mood; talk: number }> = ({ mood, talk }) => {
  const x = 256;
  const y = 212;
  const open = talk; // 0..1
  switch (mood) {
    case "laugh":
    case "excited":
      return (
        <g>
          <path
            d={`M${x - 26},${y - 4} Q${x},${y - 6} ${x + 26},${y - 4} Q${x + 20},${y + 26 + open * 4} ${x},${y + 28 + open * 4} Q${x - 20},${y + 26 + open * 4} ${x - 26},${y - 4} Z`}
            fill="#5A1E1E"
            stroke={LINE}
            strokeWidth={3}
          />
          <path
            d={`M${x - 20},${y - 2} L${x + 20},${y - 2} L${x + 17},${y + 6} L${x - 17},${y + 6} Z`}
            fill="#fff"
          />
          <ellipse cx={x} cy={y + 18 + open * 3} rx={11} ry={6} fill="#E46A6A" />
        </g>
      );
    case "wow":
      return (
        <ellipse
          cx={x}
          cy={y + 6}
          rx={11 + open * 2}
          ry={14 + open * 3}
          fill="#5A1E1E"
          stroke={LINE}
          strokeWidth={3}
        />
      );
    case "sad":
      return (
        <path
          d={`M${x - 18},${y + 10} Q${x},${y - 6 - open * 4} ${x + 18},${y + 10}`}
          stroke={LINE}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "tired":
      return (
        <path
          d={`M${x - 16},${y + 4} Q${x - 6},${y + 1 + open * 6} ${x},${y + 4} T${x + 16},${y + 4}`}
          stroke={LINE}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "think":
      return (
        <path
          d={`M${x - 14},${y + 6} Q${x + 4},${y + 8 + open * 6} ${x + 18},${y - 2}`}
          stroke={LINE}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "dizzy":
      return (
        <path
          d={`M${x - 20},${y + 6} q5,-7 10,0 t10,0 t10,0 t10,0`}
          stroke={LINE}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    default:
      // happy / wink: smile that opens while talking
      return open > 0.15 ? (
        <path
          d={`M${x - 22},${y} Q${x},${y + 4} ${x + 22},${y} Q${x},${y + 14 + open * 14} ${x - 22},${y} Z`}
          fill="#5A1E1E"
          stroke={LINE}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={`M${x - 22},${y} Q${x},${y + 20} ${x + 22},${y}`}
          stroke={LINE}
          strokeWidth={4.5}
          fill="none"
          strokeLinecap="round"
        />
      );
  }
};

const Brows: React.FC<{ mood: Mood }> = ({ mood }) => {
  let l = "M206,128 Q226,118 246,126";
  let r = "M266,126 Q286,118 306,128";
  if (mood === "sad" || mood === "tired") {
    l = "M206,124 Q228,124 246,132";
    r = "M266,132 Q284,124 306,124";
  } else if (mood === "think") {
    r = "M266,118 Q286,104 306,114";
  } else if (mood === "wow" || mood === "excited") {
    l = "M206,118 Q226,106 246,116";
    r = "M266,116 Q286,106 306,118";
  }
  return (
    <g stroke={HAIR} strokeWidth={8} fill="none" strokeLinecap="round">
      <path d={l} />
      <path d={r} />
    </g>
  );
};

const Arm: React.FC<{ side: "l" | "r"; rot: number }> = ({ side, rot }) => {
  const sx = side === "l" ? 166 : 346;
  const dir = side === "l" ? -1 : 1;
  return (
    <g transform={`rotate(${rot} ${sx} 282)`}>
      {/* sleeve: wide at the shoulder, slimmer at the wrist */}
      <path
        d={`M${sx - 26},280 Q${sx},258 ${sx + 26},280 L${sx + 20 + dir * 2},452 L${sx - 20 + dir * 2},452 Z`}
        fill={HOODIE}
      />
      <path
        d={`M${sx + dir * 6},300 L${sx + dir * 10},440`}
        stroke="#26262D"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <rect x={sx - 21 + dir * 2} y={446} width={42} height={24} rx={9} fill={HOODIE_DARK} />
      <ellipse cx={sx + dir * 2} cy={488} rx={20} ry={23} fill={SKIN} stroke={SKIN_DARK} strokeWidth={2} />
    </g>
  );
};

const Leg: React.FC<{ side: "l" | "r"; rot: number }> = ({ side, rot }) => {
  const hx = side === "l" ? 228 : 284;
  return (
    <g transform={`rotate(${rot} ${hx} 480)`}>
      <path d={`M${hx - 30},476 L${hx + 30},476 L${hx + 22},740 L${hx - 24},740 Z`} fill={JEANS} />
      <path
        d={`M${hx + (side === "l" ? 16 : -16)},492 L${hx + (side === "l" ? 12 : -12)},736`}
        stroke={JEANS_DARK}
        strokeWidth={3}
        strokeDasharray="7 5"
      />
      <rect x={hx - 26} y={724} width={50} height={14} fill={JEANS_DARK} />
      {/* white sneakers */}
      <path
        d={`M${hx - 28},738 L${hx + 18},738 Q${hx + 48},744 ${hx + 50},762 L${hx - 30},762 Z`}
        fill="#F4F4F4"
        stroke="#BDBDBD"
        strokeWidth={2}
        transform={side === "l" ? `scale(-1 1) translate(${-2 * hx} 0)` : undefined}
      />
      <rect x={hx - 32} y={760} width={66} height={10} rx={5} fill="#2A2A2A" />
    </g>
  );
};

export const Mascot: React.FC<{
  pose: Pose;
  talking: boolean;
  frame: number;
  width?: number;
  still?: boolean; // no idle sway: for deadpan moments
}> = ({ pose, talking, frame, width = 440, still = false }) => {
  const { mood } = pose;
  const blinkCycle = frame % 96;
  const blink = blinkCycle < 4 ? 0.12 : 1;
  const talk = talking ? 0.5 + 0.5 * Math.sin(frame * 1.15) : 0;
  const swing = pose.walking ? Math.sin(pose.walkPhase) * 24 : 0;
  const armSwing = pose.walking ? Math.sin(pose.walkPhase) * 14 : 0;
  const idleSway = still ? 0 : Math.sin(frame / 22) * 2.2;
  const talkNod = talking ? Math.sin(frame * 0.4) * 2 : 0;

  return (
    <svg viewBox="0 0 512 800" width={width} height={(width * 800) / 512} style={{ overflow: "visible" }}>
      {/* ground shadow stays on the floor */}
      <ellipse cx={256} cy={772} rx={120 - pose.bob * 0.3} ry={14} fill="rgba(0,0,0,0.35)" />
      <g transform={`translate(0 ${-pose.bob}) rotate(${pose.lean} 256 760)`}>
        <Leg side="l" rot={swing} />
        <Leg side="r" rot={-swing} />

        {/* neck */}
        <rect x={236} y={222} width={40} height={44} rx={10} fill={SKIN_DARK} />

        {/* hoodie torso: broad shoulders -> narrow waist (V taper) */}
        <path
          d="M142,284 Q150,256 206,250 L306,250 Q362,256 370,284 L344,372 L320,472 L192,472 L168,372 Z"
          fill={HOODIE}
        />
        {/* chest + lat shading sells the athletic build */}
        <path d="M184,330 Q220,350 252,336" stroke="#26262D" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M260,336 Q292,350 328,330" stroke="#26262D" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M206,400 L306,400 L318,452 L194,452 Z" fill="none" stroke="#2B2B33" strokeWidth={4} strokeLinejoin="round" />
        <text x={300} y={312} fontFamily="JetBrains Mono" fontWeight={800} fontSize={22} fill="#4CC9F0">
          {"</>"}
        </text>
        <rect x={188} y={460} width={136} height={30} rx={12} fill={HOODIE_DARK} />

        {/* hood bunched around the neck */}
        <path d="M196,262 Q256,312 316,262 Q306,236 256,246 Q206,236 196,262 Z" fill="#202027" />
        <path d="M214,264 Q256,292 298,264" stroke={HOODIE_DARK} strokeWidth={5} fill="none" />
        {/* drawstrings */}
        <g stroke="#E6E6E6" strokeWidth={4} strokeLinecap="round">
          <line x1={240} y1={276} x2={236 + Math.sin(frame / 9) * 2} y2={346} />
          <line x1={272} y1={276} x2={276 + Math.sin(frame / 9 + 1) * 2} y2={346} />
        </g>
        <rect x={232} y={344} width={8} height={14} rx={3} fill="#9A9A9A" />
        <rect x={272} y={344} width={8} height={14} rx={3} fill="#9A9A9A" />

        <Arm side="l" rot={pose.armL - armSwing} />
        <Arm side="r" rot={pose.armR - armSwing} />

        {/* head */}
        <g
          transform={`translate(0 ${pose.headDip + talkNod}) rotate(${pose.headRot + idleSway} 256 236)`}
        >
          <ellipse cx={186} cy={164} rx={13} ry={21} fill={SKIN} stroke={SKIN_DARK} strokeWidth={2} />
          <ellipse cx={326} cy={164} rx={13} ry={21} fill={SKIN} stroke={SKIN_DARK} strokeWidth={2} />
          {/* face with a defined adult jaw */}
          <path
            d="M188,138 Q188,62 256,62 Q324,62 324,138 L321,184 Q314,226 256,242 Q198,226 191,184 Z"
            fill={SKIN}
            stroke={SKIN_DARK}
            strokeWidth={2}
          />
          {/* short hair with a small textured quiff */}
          <path
            d="M182,152 Q170,78 220,54 Q236,30 262,40 Q284,26 304,46 Q342,66 332,152 L324,116 Q316,96 290,94 Q272,108 252,98 Q230,108 212,98 Q192,106 190,126 Z"
            fill={HAIR}
          />
          <path d="M236,46 Q250,56 246,70 M270,42 Q284,52 280,66" stroke="#2C2C2C" strokeWidth={4} fill="none" strokeLinecap="round" />

          <Brows mood={mood} />
          <Eye cx={226} cy={160} mood={mood} lookX={pose.lookX} lookY={pose.lookY} blink={blink} side="l" frame={frame} />
          <Eye cx={286} cy={160} mood={mood} lookX={pose.lookX} lookY={pose.lookY} blink={blink} side="r" frame={frame} />

          {/* glasses */}
          <g stroke={FRAME} strokeWidth={6} fill="rgba(180,220,255,0.12)">
            <rect x={198} y={138} width={56} height={44} rx={12} />
            <rect x={258} y={138} width={56} height={44} rx={12} />
          </g>
          <path d="M254,152 Q256,146 258,152" stroke={FRAME} strokeWidth={5} fill="none" />
          <line x1={198} y1={150} x2={186} y2={146} stroke={FRAME} strokeWidth={5} />
          <line x1={314} y1={150} x2={326} y2={146} stroke={FRAME} strokeWidth={5} />
          <path d="M206,146 L216,140" stroke="#fff" strokeWidth={3} opacity={0.6} strokeLinecap="round" />
          <path d="M266,146 L276,140" stroke="#fff" strokeWidth={3} opacity={0.6} strokeLinecap="round" />

          {/* nose */}
          <path d="M256,170 Q250,190 258,194" stroke={SKIN_DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* light stubble along the jaw */}
          <path d="M204,196 Q214,230 256,238 Q298,230 308,196" stroke="rgba(60,40,30,0.12)" strokeWidth={14} fill="none" />

          {(mood === "happy" || mood === "laugh" || mood === "excited" || mood === "wink") && (
            <>
              <ellipse cx={212} cy={198} rx={12} ry={7} fill="#F0A58E" opacity={0.6} />
              <ellipse cx={300} cy={198} rx={12} ry={7} fill="#F0A58E" opacity={0.6} />
            </>
          )}
          <Mouth mood={mood} talk={talk} />

          {mood === "tired" && (
            <path d="M326,108 Q336,124 326,132 Q316,124 326,108 Z" fill="#7FD3FF" stroke="#3FA9E0" strokeWidth={2} />
          )}
          {mood === "wow" &&
            [0, 1, 2, 3, 4].map((i) => {
              const a = (-150 + i * 30) * (Math.PI / 180);
              const r1 = 112 + Math.sin(frame / 3) * 4;
              return (
                <line
                  key={i}
                  x1={256 + Math.cos(a) * r1}
                  y1={140 + Math.sin(a) * r1}
                  x2={256 + Math.cos(a) * (r1 + 26)}
                  y2={140 + Math.sin(a) * (r1 + 26)}
                  stroke="#FFC857"
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              );
            })}
          {mood === "dizzy" &&
            [0, 1, 2].map((i) => {
              const a = frame / 8 + (i * Math.PI * 2) / 3;
              return (
                <text
                  key={i}
                  x={256 + Math.cos(a) * 90}
                  y={44 + Math.sin(a) * 18}
                  fontSize={34}
                  textAnchor="middle"
                  fill="#FFC857"
                >
                  ★
                </text>
              );
            })}
        </g>
      </g>
    </svg>
  );
};
