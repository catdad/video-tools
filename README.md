# 🎬 video-tools

This CLI really just makes my life easier. It may not be for everyone. If you are feeling adventurous, you may continue.

Among other things, this tool can convert videos among all sorts of formats, apply luts, batch conversions, and desktop recordings.

## Installation

This project requires Node.JS. Install that first. That part is up to you to figure out. I like using all the fancy language bits though, so install the latest version of it.

After that, you get this project from GitHub. That's it.

```bash
git clone git@github.com:catdad/video-tools.git
cd video-tools
npm install

# add this tool to your path
npm link
```

Now you can execute all the commands for this tool, from anywhere, by typing `vid`.

This project will fetch a copy of `ffmpeg` for you. Right now, it will only do so on Windows and Mac. If you need Linux, you can install it yourself, or submit a PR.

## Usage

I am not going to keep this README up to date. Instead, once you install it, execute `vid --help` to get all the details. These are the commands you'll have:

```bash
vid <command>

Commands:
  vid batch <command> [globs..]    execute any other command on a glob of files
  vid container <input> [options]  switch format container without transcoding
  vid desktop [options]            switch format container without transcoding
  vid ffmpeg [options]             ffmpeg passthrough
  vid ffprobe [options]            ffprode passthrough
  vid gif <input> [options]        create a gif from a video
  vid image <input> [options]      extract still image from video
  vid info <input>                 show ffprobe info
  vid lut <input>                  apply a LUT to a video or image
  vid x264 <input> [options]       transcode video to x264 mp4
```

From here, you can check the help of each command, such as `vid x264 --help`.

If something is missing, feel free to submit a PR.
