# video-tools

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

I am not going to keep this README up to date. Instead, once you install it, execute `vid --help` to get all the details.

If something is missing, feel free to submit a PR.
