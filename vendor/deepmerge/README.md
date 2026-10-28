# Vendored deepmerge security backport

This is deepmerge 4.3.1 from the integrity-verified npm tarball, with one documented security backport. It is not an upstream fixed release. The version stays 4.3.1; the source patch, license, provenance, and regression checks are reviewable.

The original MIT license and type declarations are preserved. Three assignments in mergeObject now call setProperty; for __proto__, this creates an own data property with Object.defineProperty instead of invoking the legacy prototype setter. Normal property writes, array merging, customMerge, clone options, symbols, and special-object handling retain their prior behavior.

This fixes returned-object prototype poisoning for null-prototype targets, null/primitive placeholders, own __proto__ target keys, and the customMerge branch. It does not claim to sanitize arbitrary objects deliberately returned by trusted custom callback code.

References: https://github.com/advisories/GHSA-gcqx-w48m-w2h4 and https://github.com/TehShrike/deepmerge/pull/277 .

The reviewed source is packed with `npm pack --ignore-scripts` as `vendor/deepmerge-4.3.1.tgz`. npm and pnpm consume that local archive instead of a directory symlink. The dedicated checker compares the exact implementation Jest resolves with `vendor/deepmerge/index.js`, so a source change requires repacking the archive. Its SHA-512 integrity is recorded in the dependency lockfiles rather than inside the archive itself.

Use a transparent local file dependency/override for deepmerge in npm and the corresponding pnpm override, regenerate both lockfiles, verify clean installs, and run the regression script plus the existing Jest suites.

The local tarball is included in registry audits. Its unchanged upstream name/version still matches GHSA-gcqx-w48m-w2h4, so npm reports the original advisory for deepmerge and its Jest parents despite the verified source backport. The registry does not inspect the patched implementation. Report that remaining registry signature honestly; do not rename the package or change its version merely to evade the finding. The dedicated 16 security and compatibility checks verify the actual dependency Jest resolves; the upstream v4.3.1 JavaScript suite supplies additional API compatibility coverage. Remove this backport once an adequate maintained upstream release is available.
