# Crosby family heritage

The Crosby, Magwire, Farr, Richardson, Pierce, Spaulding and Putnam families, built with [Belfiore/family-site-engine](https://github.com/Belfiore/family-site-engine) the same way as Vigliotti Heritage: `engine.channel` is `stable`, the Discovery Timeline is on, confidence badges stay off, "Who are you?" is on for living relatives, English and German are both offered, and the Pages workflow calls `build-site.yml@v1.5.0`.

This is the site repository. Nothing is published until a pull request is merged, and only if Sebastian says so.

## What is published

Confirmed and probable claims are on the tree, the map and the line pages. Leads and possible claims are only on `research.html`. Family tradition is labeled in the prose. Six living people have a name and a relationship only.

The map has no API key. It uses the engine's keyless OpenFreeMap style. `map.maptilerKey` and `map.googleEmbedKey` are omitted on purpose. Do not commit a key.

## Build locally

With a checkout of the engine:

```sh
python3 path/to/family-site-engine/build/validate.py --site .
python3 path/to/family-site-engine/build/build_site.py --site . --out /tmp/crosby-site --previous none
python3 -m http.server -d /tmp/crosby-site 8000
```

`--previous none` is only for a first build, before the site has a published `discoveries/state.json`. After GitHub Pages is on, `build-site.yml` fetches that file itself.

Then, against the build:

```sh
DIST=/tmp/crosby-site node tests/verify-site.js
```

`_site/` is gitignored. The build is not committed. A push to `main` is what publishes. Merge only when Sebastian says so.
