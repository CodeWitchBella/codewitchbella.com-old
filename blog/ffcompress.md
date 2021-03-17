---
title: Compressing directory of videos
date: 2021-03-17T17:05:00.408Z
---

This semester I am trying to download and locally archive bunch of videos from
all of my lectures. To make them consume less disk space I am using following
command, which I got from [this stack overflow answer](https://unix.stackexchange.com/a/38380)

```sh
ffmpeg -i video.mp4 -c:v libx265 -crf 28 video-x265.mp4
```

That is all good unless you are compressing multiple videos each day. At that
point I decided to automate that process. So I wrote following script:

```js
#!/usr/bin/node

const fs = require('fs')
const child = require('child_process')
const path = require('path')

const files = fs.readdirSync(process.cwd())
const filesSet = new Set(files)

const handledExts = new Set(['.mp4', '.mkv'])
const suffix = '-x265.mp4'

for (const file of files) {
  const ext = path.extname(file)
  if (!handledExts.has(ext)) continue
  if (file.endsWith(suffix)) continue
  const base = path.basename(file, ext)
  const target = base + suffix
  if (filesSet.has(target)) continue

  const wipTarget = base + '-wip' + suffix
  if (filesSet.has(wipTarget)) fs.rmSync(wipTarget)

  child.spawnSync(
    'ffmpeg',
    ['-i', file, '-c:v', 'libx265', '-crf', '28', wipTarget],
    { stdio: 'inherit', cwd: process.cwd() },
  )
  fs.renameSync(wipTarget, target)
}
```

which I stuck at `~/.local/bin` and named `ffcompress`. Then I ran
`chmod +x ~/.local/bin/ffcompress`, so that I could just run `ffcompress` in any
directory to compress all videos in it.

What's interesting about this script is that it actually took me longer to write
this blogpost about it than to write the script. But the script is still useful
to me. It does several things:

1. It does not convert videos that were already converted
2. If it fails for whatever reason (like me rebooting and forgetting that I had
   it running) it does not think its already done next time I run it.
3. It works on files containing space (this would be a bit harder to do in bash)
4. It's easy to use

Feel free to use it for yourself, copy it, or modify it in any way. Or maybe it
inspires you to automate some of your boring daily tasks 🙂. Happy hacking.
