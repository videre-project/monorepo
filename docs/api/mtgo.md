# MTGO Manifest API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

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

Example response:

```json
{
  "version": "3.4.157.4679",
  "codebase": "3.4.157.4679.20260623090043",
  "date": "2026-06-23T09:00:43Z",
  "public_key": "3082010a...",
  "dependencies": [
    {
      "name": "Card.dll",
      "version": "3.4.157.4679",
      "file": "Card.dll.deploy",
      "size": 12345678,
      "public_key": "3082010a...",
      "hash": {
        "algorithm": "sha256",
        "value": "..."
      }
    }
  ]
}
```

The manifest endpoint reflects Daybreak's live deployment metadata, so values
change whenever MTGO publishes a new client build.
