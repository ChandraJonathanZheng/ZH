"""Synthesize the sound effects locally (no downloads) into public/sfx/."""
import os
import subprocess

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(sec * SR)) / SR


def sweep(f0, f1, sec):
    freq = np.geomspace(f0, f1, int(sec * SR))
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def env(n, attack=0.005, decay=8.0):
    x = np.arange(n) / SR
    return np.minimum(x / attack, 1) * np.exp(-decay * x)


def pop():
    s = sweep(700, 180, 0.18)
    return s * env(len(s), decay=25)


def whoosh():
    n = int(0.55 * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    centers = np.geomspace(400, 4600, 11)
    chunk = n // len(centers)
    for i, c in enumerate(centers):
        sos = butter(2, [c * 0.7, c * 1.4], btype="band", fs=SR, output="sos")
        seg = sosfilt(sos, noise)
        out[i * chunk:(i + 1) * chunk] = seg[i * chunk:(i + 1) * chunk]
    return out * np.sin(np.pi * np.arange(n) / n) ** 2


def typing():
    n = int(4.6 * SR)
    out = np.zeros(n)
    sos = butter(2, [1500, 6000], btype="band", fs=SR, output="sos")
    pos = 0
    while pos < n - 2000:
        click = sosfilt(sos, rng.standard_normal(900)) * env(900, 0.0005, 160)
        out[pos:pos + 900] += click * rng.uniform(0.5, 1)
        pos += int(rng.uniform(0.06, 0.16) * SR)
    return out


def boom():
    s = sweep(90, 32, 1.2) * env(int(1.2 * SR), 0.003, 3.5)
    crack = sosfilt(butter(2, 900, fs=SR, output="sos"), rng.standard_normal(len(s))) * env(len(s), 0.001, 12)
    return s + 0.6 * crack


def ding():
    x = t(1.4)
    s = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(1318, 1), (1760, 0.5), (2637, 0.35), (3951, 0.2)])
    return s * env(len(x), 0.002, 3.2)


def sparkle():
    parts = []
    for f in (1568, 2093, 2637):
        x = t(0.12)
        parts.append(np.sin(2 * np.pi * f * x) * env(len(x), 0.002, 30))
    return np.concatenate(parts + [np.zeros(int(0.2 * SR))])


def boing():
    x = t(0.7)
    freq = 330 * np.exp(-2.2 * x) + 25 * np.sin(2 * np.pi * 9 * x) + 90
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(x), 0.003, 4.5)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("pop", pop), ("whoosh", whoosh), ("typing", typing), ("boom", boom),
                     ("ding", ding), ("sparkle", sparkle), ("boing", boing)]:
        s = fn()
        s = 0.9 * s / np.max(np.abs(s))
        wav = os.path.join(OUT, name + ".wav")
        sf.write(wav, s.astype(np.float32), SR)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "160k", wav[:-4] + ".mp3"],
                       check=True)
        os.remove(wav)
        print(name)


if __name__ == "__main__":
    main()
