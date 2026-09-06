# Bump the default Miru CLI version to v0.12.1

This ExecPlan is a living document. The sections Progress, Surprises &
Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date
as work proceeds.

## Scope

| Repository                                     | Access     | Description                                                                      |
| ---------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `setup-cli/`                                   | read-write | All edits: `src/versions.ts`, `__tests__/versions.test.ts`, regenerated `dist/`. |
| `cli/` (GitHub releases of `mirurobotics/cli`) | read-only  | Source of truth for which CLI versions exist. No code is read or written.        |

This plan lives in `setup-cli/plans/` because every change is made in that repo.
`plans/` does not exist there yet; `plans/backlog/` is created by this plan
(org-wide convention, already present in `backend`, `core`, `cli-private`,
`infra`).

## Purpose / Big Picture

`mirurobotics/setup-cli` is a GitHub Action that installs the `miru` CLI into a
workflow runner. Today a workflow that omits the `version` input installs Miru
CLI **v0.11.0**, which is three stable releases behind. After this change the
same workflow installs **v0.12.1**: `miru version` prints `0.12.1` and the
action's `version` output is `v0.12.1`. Users who pin `version: v0.11` keep
getting the head of the v0.11 series, which is now `v0.11.1` rather than
`v0.11.0`. Users who pin an exact version (for example `v0.7.0`) are unaffected.

## Progress

- [ ] Milestone 1 — bump `LATEST_VERSION` and the `resolve()` mappings; update
      and extend the unit tests.
- [ ] Milestone 2 — regenerate `dist/` and confirm formatting and lint are
      clean.
- [ ] Milestone 3 — run `$preflight` until it reports CLEAN.

## Surprises & Discoveries

(Add entries as work proceeds.)

## Decision Log

(Add entries as work proceeds.)

- Decision: `'v0.11'` maps to the string literal `'v0.11.1'` instead of aliasing
  `LATEST_VERSION`. Rationale: the partial-version mappings mean "head of that
  minor series"; once `LATEST_VERSION` moves to v0.12.1, leaving `'v0.11'`
  aliased would silently jump v0.11 pinners to a different minor series.
  Date/Author: 2026-09-06 / plan author.

## Outcomes & Retrospective

(Summarize at completion.)

## Context and Orientation

`setup-cli` is a TypeScript GitHub Action. Source lives in `src/`, is bundled by
rollup into a single committed file `dist/index.js`, and `action.yml` points the
runner at that bundle. The repo root used throughout this plan is
`/home/user/setup-cli`.

Files that matter here:

- `src/versions.ts` — owns the version policy. Line 5 declares
  `export const LATEST_VERSION = 'v0.11.0'`. `sanitize()` (lines 10-17) trims
  input and normalizes a `v` prefix, returning the literal `'latest'` for
  empty/`latest` input. `resolve()` (lines 23-33) maps a sanitized string
  through a `mappings` record: `'': LATEST_VERSION`, `latest: LATEST_VERSION`,
  `v0: LATEST_VERSION`, `'v0.9': 'v0.9.2'`, `'v0.10': 'v0.10.3'`,
  `'v0.11': LATEST_VERSION`. Anything not in the record is returned unchanged,
  using `Object.hasOwn` so prototype keys such as `toString` do not resolve.
- `src/main.ts` — `getInputVersion()` reads the `version` input, pipes it
  through `sanitize()` then `resolve()`, downloads the tarball, adds it to
  `PATH`, and sets the `version` output.
- `action.yml` — declares input `version` with `default: 'latest'` (line 15).
  This stays `'latest'`; `'latest'` is what routes through `LATEST_VERSION`,
  which is the constant being bumped.
- `dist/index.js` — the committed rollup bundle; it currently contains the
  literals `v0.11.0` (line 33083), `v0.9.2` (33104) and `v0.10.3` (33105). It is
  generated, never hand-edited.
- `.github/workflows/check-dist.yml` — deletes `dist/`, runs `npm ci` then
  `npm run bundle`, and fails the build if `git diff dist/` is non-empty. So the
  regenerated bundle must be committed.
- `.github/workflows/ci.yml` — job `unit-tests` runs `npm run format:check`,
  `npm run lint`, `npm run ci-test`; job `test-action` installs with
  `version: latest`; job `action-tests` installs with no `version` input across
  `ubuntu-24.04`, `ubuntu-22.04`, `ubuntu-slim`; job `version-pin-test` installs
  `v0.7.0` and greps `miru version` for `0.7.0`.
- `.github/workflows/linter.yml` — super-linter over the whole codebase with
  `VALIDATE_ALL_CODEBASE: true`, using this repo's `.markdown-lint.yml`. That
  config sets `MD046: style: fenced`, so Markdown files (including this plan)
  must use fenced code blocks, not indented ones.
- `.prettierignore` excludes only `.DS_Store`, `.licenses/`, `dist/`,
  `node_modules/`, `coverage/`. Markdown under `plans/` is therefore covered by
  `npm run format:check`, with `proseWrap: always` at 80 columns.

npm scripts (from `package.json`): `bundle` = `format:write` + `package`;
`package` = `rimraf ./dist` + rollup; `ci-test` / `test` = jest; `all` also
regenerates `badges/coverage.svg`.

Upstream release facts (verified against the `mirurobotics/cli` releases API on
2026-09-06): latest stable is **v0.12.1** (published 2026-09-06). Descending
stable order: v0.12.1, v0.12.0, v0.11.1, v0.11.0, v0.10.3. So the v0.11 series
head is `v0.11.1` and the v0.10 series head remains `v0.10.3`.

Exhaustive audit of version references in the repo (searched for `0.9`, `0.10`,
`0.11`, `0.12`, `LATEST_VERSION`, `latest`):

- `src/versions.ts:5`, `src/versions.ts:25-30` — **change** (the only
  hand-written source of truth).
- `dist/index.js:33083`, `:33104-33105` — **regenerate**, never edit by hand.
- `__tests__/versions.test.ts:62-72` — **change**: the `v0.11` assertion
  currently expects `LATEST_VERSION`.
- `__tests__/main.test.ts:35` — `const MOCK_LATEST_VERSION = 'v0.10.0'` inside a
  `jest.unstable_mockModule('../src/versions.js', ...)` block. **No change**: it
  is a deliberate stand-in that keeps `main.test.ts` independent of the real
  constant.
- `__tests__/main.test.ts:168` —
  `expect(config.inputs.version.default).toBe('latest')`. **No change**:
  `action.yml` keeps `'latest'`.
- `__tests__/releases.test.ts` — uses `v0.9.0` only to build expected download
  URLs. **No change**.
- `action.yml:12-13` — the input description cites `v0.10.0` and `v0.10` as
  syntax examples. **No change**: they illustrate accepted formats, not the
  default, and both remain valid inputs.
- `.github/workflows/ci.yml:58` (`version: latest`) and `:108`
  (`version: 'v0.7.0'`) — **no change**; they exercise the latest path and the
  exact-pin passthrough respectively.
- `README.md`, `SECURITY.md`, `src/releases.ts:31,49` — no CLI version
  references (README links to the docs site; SECURITY says "latest release";
  `releases.ts` mentions `latest-v16.x` inside Node.js doc URLs).

Nothing outside `src/versions.ts` (plus the generated bundle and the version
unit tests) hardcodes the default version.

## Plan of Work

**Milestone 1 — version policy and tests.**

In `src/versions.ts`, change line 5 to
`export const LATEST_VERSION = 'v0.12.1'`. In the `mappings` record inside
`resolve()`, change `'v0.11': LATEST_VERSION` to `'v0.11': 'v0.11.1'` and add a
new entry `'v0.12': LATEST_VERSION` after it. Leave `''`, `latest`, `v0`,
`'v0.9'` and `'v0.10'` exactly as they are. The record ends up as:
`'': LATEST_VERSION`, `latest: LATEST_VERSION`, `v0: LATEST_VERSION`,
`'v0.9': 'v0.9.2'`, `'v0.10': 'v0.10.3'`, `'v0.11': 'v0.11.1'`,
`'v0.12': LATEST_VERSION`.

In `__tests__/versions.test.ts`, inside the `describe('resolve', ...)` block:

- Rewrite the test at lines 70-72 (`resolves v0.11 to LATEST_VERSION`) as
  `resolves v0.11 to v0.11.1 (pinned)` asserting
  `expect(resolve('v0.11')).toBe('v0.11.1')`, matching the style of the
  neighbouring `v0.9` and `v0.10` cases.
- Add `resolves v0.12 to LATEST_VERSION` asserting
  `expect(resolve('v0.12')).toBe(LATEST_VERSION)`.
- Add `LATEST_VERSION is v0.12.1` asserting
  `expect(LATEST_VERSION).toBe('v0.12.1')`. This is the assertion that actually
  pins the default: every other `resolve` test compares against the
  `LATEST_VERSION` symbol and would keep passing no matter what value the
  constant held. Without this literal assertion the bump is untested.

Leave `__tests__/main.test.ts` and `__tests__/releases.test.ts` untouched.

**Milestone 2 — bundle.**

Regenerate `dist/index.js` and `dist/index.js.map` with `npm run bundle` and
commit them. Do not run `npm run all`: it additionally rewrites
`badges/coverage.svg`, which is unrelated churn.

## Concrete Steps

All commands run from `/home/user/setup-cli` on branch
`claude/cli-default-version-bump-3epypl`. Node 24 is required (`.node-version`
pins `24.4.0`).

Step 0 — install dependencies (once):

```sh
npm ci
```

Step 1 — apply the `src/versions.ts` edits from Plan of Work, then confirm:

```sh
grep -n "LATEST_VERSION = \|'v0.1" src/versions.ts
```

Expected:

```text
5:export const LATEST_VERSION = 'v0.12.1'
29:    'v0.10': 'v0.10.3',
30:    'v0.11': 'v0.11.1',
31:    'v0.12': LATEST_VERSION
```

Step 2 — apply the `__tests__/versions.test.ts` edits from Plan of Work.

Step 3 — run the unit tests:

```sh
npm run ci-test
```

Expected: `Test Suites: 3 passed, 3 total` and `Tests: 44 passed, 44 total` (42
before this change; `versions.test.ts` goes from 22 to 24 cases).

Step 4 — commit milestone 1:

```sh
git add src/versions.ts __tests__/versions.test.ts plans/
git commit
```

Commit message:

```text
feat: default to miru cli v0.12.1

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01N7MGEa1pRHhpuc9mjNnkMB
```

Step 5 — regenerate the bundle. `npm run bundle` runs `prettier --write .`
first, so it may also reformat this plan file; that reformatting is expected and
should be committed with it.

```sh
npm run bundle
```

Step 6 — verify the bundle picked up the new versions:

```sh
git diff --stat dist/
grep -c "v0.12.1" dist/index.js
```

Expected: `dist/index.js` and `dist/index.js.map` both modified, and the grep
count is at least 1.

Step 7 — confirm the checks CI runs:

```sh
npm run format:check
npm run lint
npm run ci-test
```

Expected: prettier reports `All matched files use Prettier code style!`, eslint
prints nothing and exits 0, jest reports 44 passed. (`scripts/preflight.sh` runs
exactly these three.)

Step 8 — commit milestone 2:

```sh
git add dist/ plans/
git commit
```

Commit message:

```text
build: regenerate dist for v0.12.1 default

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01N7MGEa1pRHhpuc9mjNnkMB
```

Step 9 — milestone 3: push the branch and invoke `$preflight` (agent), which
watches the GitHub Actions run on the pushed head and fixes failures from the
job logs.

## Validation and Acceptance

**Unit tests.** From `/home/user/setup-cli`, `npm run ci-test` reports 44 passed
across 3 suites. Three assertions are the acceptance signal, and each fails
before the `src/versions.ts` edit and passes after:

- `LATEST_VERSION is v0.12.1` — before: received `'v0.11.0'`.
- `resolves v0.12 to LATEST_VERSION` — before: `resolve('v0.12')` returns
  `'v0.12'` (no mapping), so it fails against `LATEST_VERSION`.
- `resolves v0.11 to v0.11.1 (pinned)` — before: `resolve('v0.11')` returns
  `'v0.11.0'`.

Unchanged and still passing: `resolves v0.9 to v0.9.2 (pinned)`,
`resolves v0.10 to v0.10.3 (pinned)`, `passes through exact version`, the
prototype-key cases, and `action.yml` `has correct structure` (input default
still `'latest'`).

**Bundle.** `.github/workflows/check-dist.yml` rebuilds `dist/` and diffs it;
the job passes only if the committed bundle matches the rebuilt one. Locally,
`grep -c "v0.12.1" dist/index.js` returns at least 1 and
`git status --porcelain dist/` is empty after `npm run bundle`.

**Live action behaviour in CI.** In `.github/workflows/ci.yml`: the
`action-tests` matrix (`ubuntu-24.04`, `ubuntu-22.04`, `ubuntu-slim`) installs
with no `version` input and its `miru version` step prints `0.12.1`, with
`steps.setup.outputs.version` equal to `v0.12.1`; `test-action`
(`version: latest`) does the same; `version-pin-test` still installs `0.7.0` and
its output still equals `v0.7.0`.

**Gate.** `$preflight` must report **CLEAN** — CI green on the pushed branch
head — before the PR leaves draft or the task is reported complete. A local
green run is not sufficient, because `check-dist`, the super-linter workflow,
and the live cross-OS install jobs only run in GitHub Actions.

## Idempotence and Recovery

Every step is safe to repeat. The edits to `src/versions.ts` and
`__tests__/versions.test.ts` are plain text changes; re-applying them is a no-op
once the greps in Step 1 match. `npm ci` and `npm run bundle` are deterministic
and can be rerun any number of times.

If `dist/` ends up with an unexpected or noisy diff, discard it and rebuild from
a clean dependency tree:

```sh
git checkout -- dist/
rm -rf node_modules
npm ci
npm run bundle
```

To roll the whole change back, either `git revert` the two commits, or restore
the affected files from the base branch:

```sh
git checkout main -- src/versions.ts __tests__/versions.test.ts dist/
```

One ordering caveat: the milestone 1 commit alone leaves `dist/` stale, so
`check-dist` would fail if CI evaluated that commit in isolation. CI runs
against the pushed branch head, and milestone 2 lands before the push in Step 9.
If the branch was pushed after milestone 1 anyway, the fix is simply to complete
milestone 2 and push again.
