# Twemoji Parser Regex Generator

Everything in this directory helps generate the [emoji regex](../../lib/regex.js).

Nothing in this directory ships with `twemoji-parser` the JavaScript package, but it is intended to satisfy any requirements for the source of generated files being openly available.

## Contributing
This document is intended as a setup guide for the regex generator; these guidelines are in addition to the [overall contributor guide](../../CONTRIBUTING.md).

#### Prerequisites
You will need [Java 8](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html), [Scala 2.12](https://www.scala-lang.org/download/2.12.8.html), and [Python 3.8](https://www.python.org/downloads/).

Python 3.8 must be in your PATH (see instructions for adding Python to your PATH for [Unix](https://unix.stackexchange.com/a/26059)).

This likely will not work on Windows; [Pants v1 does not support Windows](https://github.com/pantsbuild/pants/issues/4834). Contributions enabling and maintaining Windows support for the regex generator are very welcome, including changing build tools.

### Building
The generator is written in [Scala](https://docs.scala-lang.org/overviews/scala-book/introduction.html) using [Pants v1](https://v1.pantsbuild.org/) as its build tool.

To compile, beginning from the repo root:
1. `cd src/scala`
2. `./pants compile ::`

It's normal for the first build to take _multiple_ minutes. Subsequent builds should be substantially faster as the cache will be warm.

### Testing
Beginning from the repo root:
1. `cd src/scala`
2. `./pants test ::`

### Regenerating the Regex
1. Ensure `./src/scala/scripts/generate.sh` has the correct permissions to run: `chmod +x ./src/scala/scripts/generate.sh`
2. `./src/scala/scripts/generate.sh`