# usage: python3 compose.py <frames dir> <out.mp4> <period> <fade> <fps> <width> <height>
# Compose a seamless loop from frames rendered over [0, T+F): the last F seconds are cross-faded
# into the first F seconds. The grass is periodic by construction; only the clouds actually blend.
import sys, os, subprocess
import numpy as np
from PIL import Image
src, out, T, F, fps, w, h = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), int(sys.argv[7])
N, NF = int(round(T * fps)), int(round(F * fps))
# A keyframe exactly every 96 frames (five per 16 s loop), so the loop point looks like any other frame.
codec = (['-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-g', '96']
         if out.endswith('.webm') else
         ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-g', '96', '-keyint_min', '96', '-sc_threshold', '0', '-movflags', '+faststart'])
ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-',
                       *codec, '-pix_fmt', 'yuv420p', '-an', out], stdin=subprocess.PIPE)
def load(i):
    return np.asarray(Image.open(os.path.join(src, f'f{i:05d}.png')).convert('RGB'), dtype=np.float32)
for i in range(N):
    a = load(i)
    if i < NF:
        t = (i + 0.5) / NF
        t = t * t * (3 - 2 * t)
        a = load(i + N) * (1 - t) + a * t
    ff.stdin.write(np.clip(a + 0.5, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait()
print('wrote', out, os.path.getsize(out) // 1024, 'KB')
