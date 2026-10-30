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


def click():
    # breakpoint click: tiny high tick + low body
    x = t(0.05)
    return np.sin(2 * np.pi * 2400 * x) * env(len(x), 0.0005, 120) + 0.5 * np.sin(2 * np.pi * 300 * x) * env(len(x), 0.001, 60)


def tick():
    x = t(0.03)
    return sosfilt(butter(2, [2500, 7000], btype="band", fs=SR, output="sos"), rng.standard_normal(len(x))) * env(len(x), 0.0003, 220)


def key():
    return typing()[: int(1.6 * SR)]


def quack():
    # nasal buzz with a falling pitch, band-passed like a toy duck
    x = t(0.22)
    freq = 620 - 220 * x / 0.22
    saw = 2 * ((np.cumsum(freq) / SR) % 1) - 1
    s = sosfilt(butter(2, [900, 2600], btype="band", fs=SR, output="sos"), saw)
    return s * np.sin(np.pi * np.arange(len(x)) / len(x)) ** 0.6


def error():
    # short two-tone system alert, softened square
    parts = []
    for f in (880, 660):
        x = t(0.11)
        sq = np.tanh(4 * np.sin(2 * np.pi * f * x))
        parts.append(sq * env(len(x), 0.002, 14))
    return np.concatenate(parts)


def steps():
    out = np.zeros(int(1.6 * SR))
    lp = butter(2, 400, fs=SR, output="sos")
    for i in range(4):
        n = int(0.09 * SR)
        thump = sosfilt(lp, rng.standard_normal(n)) * env(n, 0.002, 45)
        p0 = int(i * 0.36 * SR)
        out[p0:p0 + n] += thump * (1 - i * 0.18)
    return out


def impact():
    # subtle low thud, not a trailer boom
    x = t(0.6)
    body = sweep(110, 45, 0.6) * env(len(x), 0.002, 9)
    snap = sosfilt(butter(2, 1800, fs=SR, output="sos"), rng.standard_normal(len(x))) * env(len(x), 0.0005, 60)
    return body + 0.35 * snap


def music():
    """Quiet lo-fi bed: soft kick, hats, Am7-Fmaj7-C-G pad at 90 bpm, loops cleanly."""
    bpm = 90
    beat = 60 / bpm
    bars = 8
    n = int(bars * 4 * beat * SR)
    out = np.zeros(n)
    chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [130.8, 196, 261.6, 329.6], [196, 246.9, 293.7, 392]]
    for b in range(bars):
        f = chords[b % 4]
        s0 = int(b * 4 * beat * SR)
        L = int(4 * beat * SR)
        x = np.arange(L) / SR
        pad = sum(np.sin(2 * np.pi * fr * x) + 0.3 * np.sin(4 * np.pi * fr * x) for fr in f)
        pad *= np.minimum(x / 0.3, 1) * np.minimum((4 * beat - x) / 0.3, 1)
        out[s0:s0 + L] += 0.12 * pad
        bass = np.sin(2 * np.pi * f[0] / 2 * x) * np.minimum(x / 0.02, 1) * np.exp(-1.2 * x)
        out[s0:s0 + L] += 0.35 * bass
    for k in range(bars * 4):
        p0 = int(k * beat * SR)
        if k % 2 == 0:
            kick = sweep(120, 45, 0.25) * env(int(0.25 * SR), 0.002, 18)
            out[p0:p0 + len(kick)] += 0.6 * kick
        for h in (0, 0.5):
            hp0 = p0 + int(h * beat * SR)
            hat = tick() * 0.12
            out[hp0:hp0 + len(hat)] += hat
    return sosfilt(butter(2, 3500, fs=SR, output="sos"), out)


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("pop", pop), ("whoosh", whoosh), ("typing", typing), ("boom", boom),
                     ("ding", ding), ("sparkle", sparkle), ("boing", boing),
                     ("click", click), ("tick", tick), ("key", key), ("quack", quack), ("error", error),
                     ("steps", steps), ("impact", impact), ("music", music)]:
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
