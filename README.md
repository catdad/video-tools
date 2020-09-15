# 🎬 video-tools

This CLI really just makes my life easier. It may not be for everyone. If you are feeling adventurous, you may continue.

Among other things, this tool can convert videos among all sorts of formats, apply luts, batch conversions, and desktop recordings.

## Installation

This project requires Node.JS. Install that first. That part is up to you to figure out. I like using all the fancy language bits though, so install the latest version of it.

To install the package once, you can get the latest version like this:

```bash
npm install --global https://github.com/catdad/video-tools/tarball/master
```

If you prefer to work with the repository directly, you can clone it:

```bash
git clone git@github.com:catdad/video-tools.git
cd video-tools
npm install

# add this tool to your path
npm link
```

In both cases, this will create a global CLI named `vid` that you can use to access all the functionality of this utility.

This project uses `ffmpeg` and `ffprobe` to deliver its functionality. It will fetch a copy of the necessary binaries at install time.

## Usage

I am not going to keep this README up to date. Instead, once you install it, execute `vid --help` to get all the details. These are the commands you'll have:

```bash
vid <command>

Commands:
  vid batch <command> [globs..]    execute any other command on a glob of files
  vid container <input> [options]  switch format container without transcoding
  vid desktop [options]            capture screen video
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
