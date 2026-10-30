#!/usr/bin/env bash
# Master the rendered mix for Reels/TikTok/Shorts: -15.5 LUFS integrated,
# true peak <= -1.5 dBTP. Two passes: measure first, then apply the exact
# correction (one-pass loudnorm guesses and can pump the volume).
# Usage: scripts/master.sh in.mp4 out.mp4
set -euo pipefail
in="$1"; out="$2"
target="I=-15.5:TP=-1.5:LRA=9"
stats=$(ffmpeg -hide_banner -i "$in" -af "loudnorm=$target:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v copy -af \
  "loudnorm=$target:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -movflags +faststart "$out"
ffmpeg -hide_banner -i "$out" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:" | grep -E "I:|Peak:"
