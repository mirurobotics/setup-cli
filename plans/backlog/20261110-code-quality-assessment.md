# Code quality assessment of the setup-cli repository

An audit of `mirurobotics/setup-cli` at `04ffda4` (2026-11-10): where the
action's code, CI, release process and docs fall short, and what to do about it,
in priority order. It changes no code. Each finding is meant to become its own
ExecPlan in `plans/active/` when picked up.

## How to read this

Each finding gives what is wrong, why it matters, and a suggested fix, with a
rough effort (S: under a day, M: a few days, L: a week or more).

- **P1: fix first.** Users of the action get the wrong CLI, or a CLI nobody
  verified.
- **P2: fix soon.** Gaps that make the action less useful, or make every change
  and release slower.
- **P3: tidy up.** Lint, docs and hygiene gaps that are cheap to close.

| #   | Finding                                                       | Priority | Effort |
| --- | ------------------------------------------------------------- | -------- | ------ |
| 1   | The last release failed, so `@v0` still installs CLI v0.10.1  | P1       | S      |
| 2   | "latest" is a constant that needs a release of this action    | P1       | M      |
| 3   | The downloaded CLI is not checked against its checksum        | P1       | S      |
| 4   | A bad or unknown version fails with a bare 404                | P1       | S      |
| 5   | The release process is manual, and there are two of them      | P2       | M      |
| 6   | macOS runners are rejected, though the CLI ships macOS builds | P2       | S      |
| 7   | The CLI is downloaded on every run, with no tool cache        | P2       | S      |
| 8   | Every Dependabot PR needs `dist/` rebuilt by hand             | P2       | M      |
| 9   | Tests mock the whole pipeline, and CI skips arm64 and ranges  | P2       | S      |
| 10  | The license cache is stale and never checked                  | P2       | S      |
| 11  | Lint does not use type information                            | P3       | S      |
| 12  | Unused dependencies and leftover template files               | P3       | S      |
| 13  | The local toolchain does not match CI                         | P3       | S      |
| 14  | `README.md` has no usage, inputs or outputs                   | P3       | S      |
| 15  | Workflow hygiene                                              | P3       | S      |
| 16  | Repository hygiene: stale branches, ownership and agent docs  | P3       | S      |

## What is already good

These are worth keeping as the repository changes:

- `src/` is small, typed with `strict`, and fully covered: 44 tests across 3
  suites at 100% statements, branches, functions and lines.
- `check-dist` rebuilds `dist/` on every PR, and it matches the source today.
  Format, ESLint and tests all pass at `04ffda4`.
- CI runs the real action on three hosted Ubuntu images and pins an old CLI
  (`v0.7.0`) to check exact versions pass through. All of these jobs are
  required checks on `main` (set in `mirurobotics/infra`:
  `github/terraform/repos.tf`).
- Every third-party action is pinned to a commit SHA, and Dependabot groups
  minor and patch updates.
- The release workflow refuses tags that are not on `main` and checks the tag
  against `package.json`, and posts the result to Slack.
- Version mappings use `Object.hasOwn`, so inputs such as `constructor` are not
  resolved from the prototype. Unsupported platforms and architectures fail with
  a clear message.
- There is a `SECURITY.md`, CodeQL runs nightly over the TypeScript and the
  workflows, and design decisions are written down as ExecPlans.

---

## P1: fix first

### 1. The last release failed, so `@v0` still installs CLI v0.10.1

**What.** The newest published release is `v0.2.4`, from 2026-05-27. At that
commit, `LATEST_VERSION` is `v0.10.1`. A `v0.3.0` tag was pushed on `c089e3e`,
and the Release workflow failed on it twice (2026-11-07), both times with
`Tag version (v0.3.0) does not match package.json version (0.2.4)`. So the `v0`
and `v0.2` tags were never moved, and no GitHub release exists for `v0.3.0`.
`main` is 67 commits ahead of `v0.2.4`. The same failure happened on the first
`v0.2.4` attempt and was fixed by #67.

**Why it matters.** A workflow using `mirurobotics/setup-cli@v0`, which is how
most users reference an action, gets CLI v0.10.1 when it asks for `latest`,
while `main` says v0.12.4. Partial versions such as `v0.11` and `v0.12` do not
resolve at all on `v0.2.4`, so they fail. Anyone who pinned `@v0.3.0` gets a
commit that was never released.

**Fix.** Bump `package.json` to `0.3.0` (or `0.3.1`) in a PR. After it merges,
either move `v0.3.0` to that commit or tag `v0.3.1`, and let the Release
workflow move `v0` and `v0.3`. Check that `@v0` then installs v0.12.4. Finding 5
stops this from happening again.

### 2. "latest" is a constant that needs a release of this action

**What.** `src/versions.ts` hard-codes `LATEST_VERSION = 'v0.12.4'` and a table
of partial versions (`v0.9`, `v0.10`, `v0.11`, `v0.12`). Each new CLI release
needs a PR here (source, test and `dist/`), then a release of this action, then
the floating tags to move. `__tests__/versions.test.ts` also asserts the
constant itself (`LATEST_VERSION is v0.12.4`), so every bump edits two places.
The `token` input says it is for "API requests (avoids rate limits)", but the
action makes no API requests.

**Why it matters.** "latest" means "the newest CLI that someone remembered to
put into a released version of this action". Finding 1 shows how far that can
drift: five months and two CLI minor versions. A new minor series (for example
`v0.13`) passes through unresolved and fails until this table is updated.

**Fix.** Pick one:

- **Resolve at runtime.** Call `GET /repos/mirurobotics/cli/releases` with the
  `token` input (which then does what its description says), pick the newest
  non-prerelease that satisfies the input with `semver.maxSatisfying` (`semver`
  is already a dependency), and keep the current constant only as a fallback
  when the API is unreachable. This is what `actions/setup-node` and
  `actions/setup-go` do.
- **Automate the bump.** Have the CLI release workflow send a
  `repository_dispatch` here, and add a workflow that opens the version-bump PR
  (constant, test, `dist/`, `package.json`) and tags a release once it merges.

Runtime resolution has fewer moving parts. Either way, drop the test that
asserts the constant's value.

### 3. The downloaded CLI is not checked against its checksum

**What.** `src/main.ts` downloads `cli_<OS>_<arch>.tar.gz`, extracts it and adds
it to `PATH` without any integrity check. The CLI releases already publish
`cli_<version>_checksums.txt` with a SHA-256 for every archive (checked for
v0.12.4), plus an SBOM per archive.

**Why it matters.** The binary runs in users' CI, often next to deploy
credentials. A truncated download, a swapped release asset or a compromised
mirror would go unnoticed. Checking the checksum is the minimum users expect
from a setup action.

**Fix.** Download the checksums file for the resolved version, hash the archive
with `crypto.createHash('sha256')`, and fail with a clear message on a mismatch
or a missing entry. Add a unit test for both cases. Later, consider verifying an
artifact attestation (`gh attestation verify`) if the CLI release starts
publishing them.

### 4. A bad or unknown version fails with a bare 404

**What.** `versions.sanitize` accepts any string and adds a `v` prefix, and
`resolve` passes anything it does not know through unchanged. So
`version: v0.13`, `v1`, `0.7` or `main` all build a download URL and fail inside
`tc.downloadTool` with `Unexpected HTTP response: 404`. The input is also placed
into the URL path as-is, so a value containing `../` changes which path on
`github.com` is fetched, with the token attached.

**Why it matters.** The user sees a 404 for a file they never named, not
"version v0.13 does not exist; available: …". Typos cost a CI round each.

**Fix.** Validate the sanitized input with `semver.valid` or `semver.validRange`
and reject anything else before building the URL. When the download returns 404,
say which version was requested and how to list the available ones. With finding
2's runtime resolution, unknown versions can be rejected with the list of valid
ones.

---

## P2: fix soon

### 5. The release process is manual, and there are two of them

**What.**

- **Two processes.** `scripts/release.sh` (from the `actions/typescript-action`
  template) tags a release, moves only the major tag, and creates a
  `releases/v#` branch for a new major. `.github/workflows/release.yml` moves
  both the major and minor tags on any `v*.*.*` tag push. They disagree, and
  nothing says which one to use.
- **Manual version.** Both need `package.json`'s `version` bumped by hand first.
  Forgetting it is what broke `v0.2.4` and `v0.3.0` (finding 1).
- **Partial state.** When the release job fails, the version tag stays pushed
  and the floating tags stay behind, with no release.

**Fix.** Make the tag the only source of truth: either drop the `package.json`
check (the version field is not used, since the package is private), or use a
release-PR tool such as `release-please` that bumps `package.json`, writes the
changelog and tags in one step. Delete `scripts/release.sh`. Document the
process in a short `RELEASING.md`.

### 6. macOS runners are rejected, though the CLI ships macOS builds

**What.** `mapPlatform` only maps `linux`. The CLI releases include
`cli_Darwin_arm64.tar.gz` and `cli_Darwin_x86_64.tar.gz` (checked for v0.7.0,
v0.9.2, v0.10.3, v0.11.1 and v0.12.4), and Linux `i386` too.

**Why it matters.** A workflow on `macos-latest` fails with "Unsupported
platform", although a binary exists for it.

**Fix.** Map `darwin` to `Darwin`, add a `macos-latest` (arm64) job and an Intel
macOS job to the CI matrix, and add the new job names to `required_checks` in
`mirurobotics/infra`. Windows stays unsupported until the CLI ships Windows
builds.

### 7. The CLI is downloaded on every run, with no tool cache

**What.** `@actions/tool-cache` is used for `downloadTool` and `extractTar`
only. `tc.find` and `tc.cacheDir` are not used.

**Why it matters.** Each job downloads the archive again. On self-hosted
runners, which keep the tool cache between jobs, this is wasted time and one
more chance of a network failure.

**Fix.** After resolving the exact version, try
`tc.find('miru', version, arch)`. On a miss, download, verify (finding 3),
extract and `tc.cacheDir(dir, 'miru', version, arch)`, then add that path. About
10 lines plus tests.

### 8. Every Dependabot PR needs `dist/` rebuilt by hand

**What.** 35 of the last 60 commits on `main` are from Dependabot. Any update to
a production dependency changes `dist/index.js`, which `check-dist` requires to
be rebuilt, so someone has to check out the branch, run `npm run bundle` and
push (for example PR #157). Two old branches from this work are still on the
remote (finding 16).

**Why it matters.** Routine updates wait for a person or an agent, and are easy
to let pile up.

**Fix.** Add a workflow on `pull_request` from `dependabot[bot]` that runs
`npm ci && npm run bundle` and pushes the result with a GitHub App token, so the
follow-up CI run is triggered. Alternatively, accept the manual step but
document it.

### 9. Tests mock the whole pipeline, and CI skips arm64 and ranges

**What.**

- `__tests__/main.test.ts` replaces `versions` and `releases` with mocks that
  behave differently from the real modules (for example, the mock `sanitize`
  does not add a `v`). No test runs input → sanitize → resolve → URL together,
  so a mismatch between the modules would pass.
- `__fixtures__/core.ts` is unused; `main.test.ts` defines its own
  `@actions/core` mock.
- Coverage is 100%, but `coverageThreshold` is commented out in
  `jest.config.js`, so a drop would not fail CI. The committed
  `badges/coverage.svg` is only updated by hand.
- The CI matrix has three x86_64 Ubuntu images. The arm64 mapping is never
  exercised on a real runner, and no job tests a partial version (`v0.11`) or a
  bad version failing cleanly.

**Fix.** Add one test of `run()` that mocks only `@actions/core`,
`@actions/tool-cache` and `os`. Use the `__fixtures__/core.ts` mocks or delete
the file. Turn on `coverageThreshold` at 100. Add `ubuntu-24.04-arm` and a
`version: v0.11` job to the matrix, and a job that expects `version: v9.9.9` to
fail (`continue-on-error` plus a check of the step outcome). Remember to add new
job names to `required_checks` in `mirurobotics/infra`.

### 10. The license cache is stale and never checked

**What.** `.licenses/` was last updated on 2026-02-04. It lists `@actions/core`
1.11.1 and `@actions/http-client` 2.2.3 (installed: 3.0.1 and 4.0.0), `undici`
5.28.5 (installed: 6.29.1) and `@fastify/busboy` (no longer installed), and has
no entry for `@actions/tool-cache` or `semver`, which are bundled into `dist/`.
The `licensed.yml` workflow only runs by hand, and its "update" step pushes
straight to `main`, which branch protection blocks.

**Why it matters.** The cache exists to show that every bundled dependency has
an allowed license. As it stands it shows nothing.

**Fix.** Regenerate `.licenses/` with `licensed cache` in a PR. Run
`licensed status` on pull requests and pushes to `main` (the triggers are
already written and commented out), and remove the auto-commit step, or have it
open a PR instead.

---

## P3: tidy up

### 11. Lint does not use type information

**What.** `eslint.config.mjs` turns on `projectService`, which builds type
information, but extends `tseslint.configs.recommended`, which uses none of it.
So rules such as `await-thenable` and `no-floating-promises` do not run.
`src/main.ts` awaits `releases.getDownloadUrl`, which returns a string, and
`src/index.ts` calls `run()` without handling the promise.

**Fix.** Extend `tseslint.configs.recommendedTypeChecked` (and consider
`strictTypeChecked`), fix what it reports, and drop the stray `await`.

### 12. Unused dependencies and leftover template files

**What.**

- `semver` is a direct production dependency and `@types/semver` a development
  one, but no source file imports `semver`. It is bundled only because
  `@actions/tool-cache` needs it. (Keep it if finding 2 or 4 starts using it.)
- `.env.example`, used by `npm run local-action`, sets `INPUT_MILLISECONDS=2400`
  from the template. This action's inputs are `version` and `token`.
- `jest.config.js` and `.github/workflows/licensed.yml` keep the template's
  "uncomment the below lines" blocks, and `eslint.config.mjs` ignores a `linter`
  directory that does not exist.
- `package.json` lists `@rollup/rollup-linux-x64-gnu: "*"` as an optional
  dependency.

**Fix.** Remove what is unused, set `.env.example` to `INPUT_VERSION=latest`,
and pin the rollup binary to the same version as `rollup` (Dependabot already
ignores it).

### 13. The local toolchain does not match CI

**What.**

- `.devcontainer/devcontainer.json` uses the `typescript-node:20` image, but
  `package.json` needs Node `>=24` and `.node-version` says 24.4.0. On Node 20
  (npm 10), `npm ci` fails because the lockfile was written by npm 11
  (`Missing: glob@13.0.7 from lockfile`), and the container's `npm install`
  rewrites the lockfile instead.
- `scripts/lint.sh` runs `super-linter:slim-latest`, while CI pins super-linter
  v9.0.0, so a local lint run can disagree with CI.
- `@types/node` is `^26`, so the types accept Node 26 APIs that the `node24`
  runtime does not have.

**Fix.** Use a Node 24 devcontainer image (or install Node from
`.node-version`), pin `scripts/lint.sh` to the same super-linter digest as
`linter.yml`, and pin `@types/node` to `^24`.

### 14. `README.md` has no usage, inputs or outputs

**What.** `README.md` is a title, badges and a link to the docs site. It does
not show a usage example, the `version` and `token` inputs, the `version`
output, the supported platforms, or what partial versions resolve to.

**Why it matters.** The repository page and the Marketplace listing are where
most users first look, and they show nothing they can copy.

**Fix.** Add a short usage block, an inputs and outputs table, and the supported
platforms, and keep the link to the full docs.

### 15. Workflow hygiene

**What.**

- No job sets `timeout-minutes` except the CodeQL gate, so a hung download holds
  a runner for six hours.
- `ci.yml` has no `concurrency` group, so pushes to the same PR run in full side
  by side.
- The `test-action` job is a copy of `action-test-ubuntu-24.04` on a Blacksmith
  runner, and both are required.
- `ci.yml` interpolates `${{ steps.setup.outputs.version }}` straight into
  `run:` scripts. The value comes from the workflow file, so the risk is low,
  but passing it through `env:` is the safe pattern.
- CodeQL runs `autobuild` for TypeScript, which needs no build;
  `build-mode: none` is faster.
- Required check names are kept by hand in `mirurobotics/infra`, so renaming or
  adding a matrix job here needs a PR there too. Note this in the workflow file.

**Fix.** Add the timeouts and a
`concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`, drop
`test-action` (and its required check), move outputs to `env:`, and add a
comment in `ci.yml` pointing at the required checks list.

### 16. Repository hygiene: stale branches, ownership and agent docs

**What.**

- **Stale branches.** `claude/fix-ci-failures-0ti9k` (2026-05-09) and
  `claude/setup-cli-dependabot-bundle-3a29ag` (2026-06-26) are still on the
  remote.
- **Ownership.** `.github/CODEOWNERS` names one person (`ben-miru`), and a code
  owner must approve every PR, so one absence blocks every merge.
- **Agent docs.** 22 of the last 60 commits are by agents, but there is no
  `AGENTS.md` or `CLAUDE.md`. The rules they need (rebuild `dist/` after any
  source or production dependency change, run `scripts/preflight.sh`, plan files
  must pass markdownlint, Prettier and textlint terminology) are only in a
  completed plan's notes.

**Fix.** Delete the two branches. Add a second code owner. Add a short
`AGENTS.md` with the build, test, `dist/` and release rules.

---

## Suggested order

1. **Ship what is on `main`:** finding 1, so `@v0` users get CLI v0.12.4.
1. **The install path:** findings 4, 3 and 7 together, since they all change
   `src/main.ts` and its tests, then finding 6.
1. **Releases:** findings 2 and 5, so the next CLI release reaches users without
   a hand-made PR and tag.
1. **Tests and CI:** findings 9 and 15, together with the `required_checks`
   change in `mirurobotics/infra`.
1. **Hygiene, any time:** findings 8, 10, 11, 12, 13, 14 and 16.

## How this was checked

The whole repository was read at `04ffda4`. With Node 24.4.0 and npm 11,
`npm ci`, `npm run format:check`, `npm run lint` and `npm run ci-test` all pass
(44 tests, 100% coverage), and `npm run package` reproduces `dist/` with no
diff. `npm audit --omit=dev` finds nothing; the full audit lists 8 low-severity
findings in development dependencies. Release history and the failed Release
runs were read from the GitHub API. The CLI's release assets (checksums file and
macOS archives) were checked by downloading them for v0.12.4 and probing older
versions. Required checks were read from `github/terraform/repos.tf` in
`mirurobotics/infra`.
