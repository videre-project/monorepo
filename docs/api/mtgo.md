# MTGO Manifest API

The MTGO manifest API reports the current MTGO ClickOnce deployment metadata used by Videre's ingestion services to detect client updates.

```text
GET /mtgo/manifest
```

The endpoint fetches Daybreak's live MTGO deployment and application manifests, then returns a normalized JSON document.

## Response Shape

The manifest includes:

```text
version
codebase
date
public_key
dependencies
```

Each dependency includes:

```text
name
version
file
size
public_key
hash
```

`hash` contains the manifest digest algorithm and value when MTGO publishes one for that dependency.
