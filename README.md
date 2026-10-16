# macro-research-workbench
Public macroeconomic data dashboard. No paid reports or internal materials.

## Publishing snapshots

After writing the final UTF-8 `dashboard.json`, run:

```sh
node scripts/snapshot-manifest.mjs
node scripts/snapshot-manifest.mjs --check
node --test tests/refresh.test.mjs
```

Publish the dashboard and manifest together from the same commit. The hash covers
exact file bytes, including whitespace and line endings; do not rewrite the JSON
after hashing. This updates only the transport hash, preserving research approval
fields such as `status`, `source_gate_passed`, and `independent_qa`.

The public reader polls the small manifest every 60 seconds while visible. It
skips the dashboard when its hash matches either the displayed or pending verified
snapshot. Manual refresh still downloads. Missing/invalid manifests, HTTP errors,
hash mismatches and JSON errors keep current content and retry on the next poll.
On first load an invalid manifest displays the existing loading-error screen until
a valid publication is available. Local `data/dashboard.json` mode is unchanged.
SHA-256 detects inconsistent publication bytes; it is not a signature protecting
against an attacker who can replace both files.

This repository contains compiled assets only, with no upstream publisher or app
source. The current manifest omitted the transport hash entirely, disabling both
the skip and integrity branches. Upstream publishing must incorporate the command
above and preserve these checks; CI validates but does not regenerate a stale hash
or block hosting unless configured as a required deployment check. If rebuilding
the app upstream, port the public manifest validation and byte hashing changes
from `index-BB7nPvbl.js` into its source. Tests execute its actual refresh callback.
