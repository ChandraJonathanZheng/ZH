"""Generate the voiceover with Kokoro (local, free) and write src/voiceover.json.

Usage: python3 scripts/tts.py <dir with kokoro-v1.0.onnx and voices-v1.0.bin> [scene ids...]

Pacing is part of the joke: each level is spoken a little faster than the
last, then Level 7 suddenly slows down with real pauses.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "voiceover")
FPS = 30
GAP = 0.06  # tight gap between lines: no dead air

# Each line: (spoken text, caption or None, {"pause": extra silence before})
# caption None = the big on-screen graphic already says it, so no subtitle.
# *word* in a caption = highlighted word.
SCRIPT = [
    # Under ~1 s: premise only, then hard cut.
    ("hook", 1.3, 0.05, [
        ("Seven levels.", None, {}),
    ]),
    # The text says "10 YEARS OF DEBUGGING", so the voice adds something new.
    ("intro", 1.3, 0.05, [
        ("I've hit all seven.", None, {}),
    ]),
    ("l1", 1.12, 0.2, [
        ("Level one. console dot log.", None, {}),
        ("here. here two. HERE, PLEASE.", None, {}),
    ]),
    ("l2", 1.16, 0.3, [
        ("Level two. The debugger.", None, {}),
        ("Step, step, step... undefined.", None, {"pause": 0.25}),
        ("Back to console dot log.", None, {"pause": 0.15}),
    ]),
    ("l3", 1.2, 0.3, [
        ("Level three. The rubber duck.", None, {}),
        ("Explain the bug. Fix it mid sentence.", "Explain the bug... *fix it mid-sentence.*", {}),
    ]),
    ("l4", 1.24, 0.3, [
        ("Level four. You actually read the error.", "You *actually* read the error.", {}),
        ("It told you everything.", None, {"pause": 0.3}),
    ]),
    ("l5", 1.27, 0.3, [
        ("Level five. Git bisect.", None, {}),
        ("Hunt down which past you broke it.", "Hunt down which *past-you* broke it.", {}),
    ]),
    ("l6", 1.3, 0.25, [
        ("Level six. Take a walk.", None, {}),
        ("The fix finds you in the shower.", None, {"pause": 0.45}),
        ("Wait. I know the bug.", None, {"pause": 0.35}),
    ]),
    ("l7", 1.0, 0.45, [
        ("Level seven.", None, {"pause": 0.25}),
        ("It works.", None, {"pause": 0.55}),
        ("Nobody knows why.", None, {"pause": 0.45}),
        # One clip per word so the silence between them is exact.
        ("Do.", None, {"pause": 0.5}),
        ("Not.", None, {"pause": 0.22}),
        ("Touch.", None, {"pause": 0.22}),
        ("It.", None, {"pause": 0.3}),
    ]),
    ("cta", 1.15, 1.6, [
        ("Be honest. What level are you?", None, {}),
        ("Drop the number.", None, {"pause": 0.1}),
    ]),
]


def master(src: str, dst: str) -> None:
    # Gentle cleanup only: rumble high-pass, a little presence, soft compression.
    # No noise reduction: TTS has no background noise, and NR would add artifacts.
    chain = ("highpass=f=80,"
             "equalizer=f=250:t=q:w=1.2:g=-1.5,"
             "equalizer=f=3200:t=q:w=1.0:g=2,"
             "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", chain, "-b:a", "192k", dst], check=True)


def main(model_dir: str, only: list[str]) -> None:
    # `only`: regenerate just these scenes and keep the other clips untouched.
    os.makedirs(OUT, exist_ok=True)
    manifest_path = os.path.join(ROOT, "src", "voiceover.json")
    old = {s["id"]: s for s in json.load(open(manifest_path))} if only else {}
    for f in os.listdir(OUT):
        if not only or f.split("-")[0] in only:
            os.remove(os.path.join(OUT, f))
    kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    voice = kokoro.get_voice_style("am_michael") * 0.6 + kokoro.get_voice_style("am_onyx") * 0.4
    manifest = []
    for scene_id, speed, tail, lines in SCRIPT:
        if only and scene_id not in only:
            manifest.append(old[scene_id])
            continue
        prev_end = 0.0
        out_lines = []
        for i, (say, caption, opts) in enumerate(lines):
            samples, sr = kokoro.create(say, voice=voice, speed=speed, lang="en-us")
            # Trim silence so timings match the real speech.
            loud = np.where(np.abs(samples) > 0.01)[0]
            samples = samples[max(loud[0] - int(0.02 * sr), 0): loud[-1] + int(0.06 * sr)]
            wav = os.path.join(OUT, f"{scene_id}-{i}.wav")
            sf.write(wav, samples, sr)
            master(wav, wav[:-4] + ".mp3")
            os.remove(wav)
            dur = len(samples) / sr
            start = (0.05 if i == 0 else prev_end + GAP) + opts.get("pause", 0)
            prev_end = start + dur
            out_lines.append({"text": caption, "say": say, "file": f"voiceover/{scene_id}-{i}.mp3",
                              "start": round(start, 3), "dur": round(dur, 3)})
        seconds = prev_end + tail
        manifest.append({"id": scene_id, "seconds": round(seconds, 3),
                         "frames": int(np.ceil(seconds * FPS)), "lines": out_lines})
        print(f"{scene_id:6} {seconds:5.2f}s", [(l["start"], round(l["start"] + l["dur"], 2)) for l in out_lines])
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print("total", round(sum(s["seconds"] for s in manifest), 2))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
