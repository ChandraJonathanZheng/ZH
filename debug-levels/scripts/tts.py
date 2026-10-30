"""Generate the voiceover with Kokoro (local, free) and write src/voiceover.json.

Usage: python3 scripts/tts.py <dir with kokoro-v1.0.onnx and voices-v1.0.bin>
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
GAP = 0.12

# (scene id, script seconds, [(caption text, spoken text or None)])
SCRIPT = [
    ("hook", 3, [("There are 7 levels of debugging.", "There are seven levels of debugging."),
                 ("Most devs are stuck at level 2.", "Most devs are stuck at level two.")]),
    ("intro", 3, [("I'm Chandra, a full stack developer for 10 years.",
                   "I'm Chandra, a full stack developer for ten years."),
                  ("Let me show you something.", None)]),
    ("l1", 7, [("Level 1: console.log('here').", "Level one. console dot log, here."),
               ("Then 'here2'. Then 'HERE PLEASE'.", "Then, here two. Then... HERE, PLEASE!")]),
    ("l2", 7, [("Level 2: the debugger.", "Level two. The debugger."),
               ("You set one breakpoint, panic,", None),
               ("and go back to console.log.", "and go back to console dot log.")]),
    ("l3", 8, [("Level 3: the rubber duck.", "Level three. The rubber duck."),
               ("You explain the bug out loud,", None),
               ("and fix it before you finish the sentence.", None)]),
    ("l4", 8, [("Level 4: you read the error message. All of it.",
                "Level four. You read the error message. All of it."),
               ("Turns out it told you exactly what was wrong.", None)]),
    ("l5", 8, [("Level 5: git bisect.", "Level five. Git bisect."),
               ("You binary-search your own history", None),
               ("to find which past-you ruined everything.", "to find which past you, ruined everything.")]),
    ("l6", 9, [("Level 6: you take a walk,", "Level six. You take a walk,"),
               ("and the fix shows up in the shower 20 minutes later.",
                "and the fix shows up in the shower, twenty minutes later.")]),
    ("l7", 7, [("Level 7: you open the bug, stare at it,", "Level seven. You open the bug. Stare at it."),
               ("and it fixes itself.", None),
               ("Nobody knows why. Never touch it again.", "Nobody knows why. Never touch it again.")]),
    ("cta", 3, [("Comment your level.", None), ("Be honest.", None)]),
]


def main(model_dir: str) -> None:
    os.makedirs(OUT, exist_ok=True)
    kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    voice = kokoro.get_voice_style("am_michael") * 0.6 + kokoro.get_voice_style("am_onyx") * 0.4
    manifest = []
    for scene_id, script_seconds, lines in SCRIPT:
        prev_end = 0.0
        out_lines = []
        for i, (text, say) in enumerate(lines):
            samples, sr = kokoro.create(say or text, voice=voice, speed=1.12, lang="en-us")
            # Trim leading/trailing silence so timings match the real speech.
            loud = np.where(np.abs(samples) > 0.01)[0]
            samples = samples[max(loud[0] - int(0.03 * sr), 0): loud[-1] + int(0.08 * sr)]
            wav = os.path.join(OUT, f"{scene_id}-{i}.wav")
            sf.write(wav, samples, sr)
            mp3 = wav[:-4] + ".mp3"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", mp3], check=True)
            os.remove(wav)
            dur = len(samples) / sr
            start = 0.15 if i == 0 else prev_end + GAP
            prev_end = start + dur
            out_lines.append({"text": text, "file": f"voiceover/{scene_id}-{i}.mp3",
                              "start": round(start, 3), "dur": round(dur, 3)})
        # Pace by the real audio, not the script estimate: dead air loses viewers.
        tail = {"l7": 1.2, "cta": 1.6}.get(scene_id, 0.6)
        seconds = prev_end + tail
        manifest.append({"id": scene_id, "seconds": round(seconds, 3),
                         "frames": int(np.ceil(seconds * FPS)), "lines": out_lines})
        print(scene_id, round(seconds, 2))
    with open(os.path.join(ROOT, "src", "voiceover.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("total", round(sum(s["seconds"] for s in manifest), 2))


if __name__ == "__main__":
    main(sys.argv[1])
