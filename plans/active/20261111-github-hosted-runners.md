# Run setup-cli CI on GitHub-hosted `ubuntu-latest` runners

This ExecPlan is a living document. The sections Progress, Surprises &
Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date
as work proceeds.

## Scope

| Repository                            | Access     | Description                                                                                                                                                            |
| ------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setup-cli/` (mirurobotics/setup-cli) | read-write | Change the 12 Blacksmith runner labels in `.github/workflows/` to `ubuntu-latest`, and drop the Blacksmith labels from `actionlint.yml`. No other source file changes. |
| `docs/`, `gotools/`                   | read-only  | Exemplar mirurobotics/docs#320 and sibling mirurobotics/gotools#69 made the same change and settled the label, the inline comment and the label cleanup.               |
| `cli/`                                | read-only  | Precedent: already passes `ubuntu-latest` to the same pinned reusable AI review workflow.                                                                              |

This plan lives in `setup-cli/plans/` because the only edits are in the
setup-cli repository. Work on the checked-out branch
`claude/youthful-lamport-yn0sf2` (base: `main` at 04ffda4).

Out of scope: the same move in agent, the last follow-up, in its own PR.

## Purpose / Big Picture

mirurobotics/setup-cli is a public repository. GitHub-hosted standard runners
are free for public repositories (Linux: 4 vCPU, 16 GB) and do not draw from the
GitHub Enterprise Cloud included compute allowance, while every Blacksmith
minute spent here is billed. After this change every job in the setup-cli
workflows runs on a standard GitHub-hosted runner, so setup-cli CI costs
nothing. The jobs keep their names and steps, so branch protection's required
checks are unchanged. A reader sees it working when the job logs on the PR show
"Runner name: GitHub Actions" and an image of `ubuntu-24.04` instead of a
Blacksmith runner, and all checks are green.

This PR follows the exemplar mirurobotics/docs#320 and the sibling
mirurobotics/gotools#69, and cites both in its body.

## Decisions

### Precedent

| New file                                         | Mirrors                                                                                                                                                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plans/active/20261111-github-hosted-runners.md` | `docs/plans/active/20261111-github-hosted-runners.md` (the exemplar's plan), `gotools/plans/active/20261111-github-hosted-runners.md` and `plans/completed/20260906-bump-default-cli-version-v0-12-1.md` |

No source file is added. Each edited line mirrors docs#320 and gotools#69,
written as
`runs-on: ubuntu-latest # standard GitHub-hosted runners are free in public repos`.
The `with: runs-on:` input to the AI review workflow mirrors
`cli/.github/workflows/ai-review.yml`, which passes `ubuntu-latest` to
`mirurobotics/.github/.github/workflows/ai-review.yml` at the same SHA setup-cli
pins (`bf09161`). Dropping the Blacksmith labels from the actionlint
configuration mirrors gotools#69.

This plan departs from the sibling plans' layout only where this repository's
linters, which check this file, require it: fenced code blocks instead of
indented ones (`.markdown-lint.yml` sets MD046 to fenced), prose wrapped at 80
columns and aligned tables (`npm run format:check` covers `plans/` with
`proseWrap: always`), and the word repository spelled out, since the textlint
terminology rule rejects `repo`.

### Left out

- The agent workflows: the last follow-up PR, citing docs#320. Only its Linux
  jobs are candidates; its Windows jobs (`blacksmith-4vcpu-windows-2025` in
  `ci.yml` and `release.yml`) stay on Blacksmith, and `builder.yml` uses
  `useblacksmith/*` Docker actions that need their own replacement.
- The `action-tests` matrix in `ci.yml` (`runs-on: ${{ matrix.os }}` over
  `ubuntu-24.04`, `ubuntu-22.04` and `ubuntu-slim`): already standard
  GitHub-hosted runners.
- A `# yamllint disable-line rule:line-length` comment above each changed line:
  the new lines are 84 and 86 characters, over the `max: 80` in
  `.yaml-lint.yml`, but that rule is `level: warning`, and `super-linter` fails
  on `yamllint` warnings only when `YAML_ERROR_ON_WARNING` is true, which
  `linter.yml` does not set. The workflows already hold 13 lines over 80
  characters with no disable comment (for example `release.yml:49`, 106
  characters), and the `Lint` workflow passed on `main` at 04ffda4. This
  repository has no disable comments anywhere, so the plain line matches both
  the exemplar and the repository.
- The `paths` ignore in `actionlint.yml`: unrelated to runners, so it stays.
- Larger or ARM runners, timeout or concurrency changes, and bumping the pinned
  reusable-workflow and action SHAs: not needed to move off Blacksmith.
- Dispatching `release.yml` or `licensed.yml` to test them: both act on the
  repository (see Context and Orientation), so they are verified on their next
  real run.

## Progress

- [x] Move this plan to `plans/active/`.
- [x] Replace the 12 labels and drop the actionlint Blacksmith labels.
- [x] Commit the milestone (message in Concrete Steps).
- [x] Source written
- [ ] Push and open the draft PR; CI and a dispatched CodeQL run pass.
- [ ] Preflight reports `CLEAN`.
- [ ] After merge: AI Review, the `main` push runs and nightly CodeQL pass.
- [ ] On the next release and the next manual Licensed run: both pass.

## Surprises & Discoveries

(Add entries as work proceeds.)

## Decision Log

(Add entries as work proceeds.)

## Outcomes & Retrospective

(Summarize at completion.)

## Context and Orientation

setup-cli is a TypeScript GitHub Action that installs the `miru` command-line
tool on a workflow runner. A runner is the virtual machine a GitHub Actions job
runs on, chosen by the job's `runs-on` key. `blacksmith-2vcpu-ubuntu-2404` is a
label served by Blacksmith, a paid third-party runner provider; `ubuntu-latest`
is GitHub's own hosted Ubuntu runner, which resolves to `ubuntu-24.04` today,
the same release. In public repositories `ubuntu-latest` has 4 vCPU and 16 GB,
so every moved job gains cores. The only timeout is `timeout-minutes: 5` on the
`changes` job in `codeql-analysis.yml`.

The label `blacksmith-2vcpu-ubuntu-2404` appears 12 times, all in
`.github/workflows/` (line numbers as of `main` at 04ffda4):

- `ai-review.yml:30`, job `ai-review`. Not a `runs-on` key but a
  `with: runs-on:` input to the reusable workflow
  `mirurobotics/.github/.github/workflows/ai-review.yml`, which uses it as its
  job's runner.
- `check-dist.yml:26` (`check-dist`).
- `ci.yml:17` (`unit-tests`), `:48` (`test-action`), `:99` (`version-pin-test`).
- `codeql-analysis.yml:18` (`changes`), `:34` (`codeql`).
- `licensed.yml:25` (`licensed`).
- `linter.yml:24` (`lint`).
- `release.yml:14` (`check-main`), `:37` (`release`), `:94` (`notify`).

`ci.yml:67` (`action-tests`) runs on `${{ matrix.os }}` over `ubuntu-24.04`,
`ubuntu-22.04` and `ubuntu-slim`, which are already GitHub-hosted labels, and
stays as it is.

`actionlint.yml` at the repository root (not under `.github/`) configures
`actionlint`, a GitHub Actions workflow linter that rejects a `runs-on` label it
does not know. Its `self-hosted-runner` block (lines 3 to 7) lists only
`blacksmith-2vcpu-ubuntu-2404`, `blacksmith-4vcpu-ubuntu-2404` and
`blacksmith-8vcpu-ubuntu-2404`; `ubuntu-latest` is a standard label and needs no
entry. Its `paths` block ignores an unrelated `node24` finding.

`linter.yml` runs `super-linter/super-linter/slim` v9.0.0 over the whole
codebase (`VALIDATE_ALL_CODEBASE: true`) with `LINTER_RULES_PATH: .`, so it
reads its configuration files from the repository root: `actionlint.yml`,
`.yaml-lint.yml` for `yamllint` and `.markdown-lint.yml` for `markdownlint`. It
also runs the textlint terminology rule, which, as the earlier setup-cli plan
found, checks plan files too. `.yaml-lint.yml` sets `line-length` to `max: 80`
at `level: warning`. Separately, the `unit-tests` job in `ci.yml` runs
`npm run format:check` (`prettier --check .`), which covers the YAML files
touched here and this plan.

Reading every workflow found no Blacksmith-only behavior: no `useblacksmith/*`
actions, no sticky disks, no Docker layer caching and no IP allowlists. Caching
comes from `actions/setup-node` (`cache: npm`), which uses the standard GitHub
Actions cache on any runner. `release.yml` uses only `actions/checkout`, `git`,
`jq` and `gh` (all on GitHub's `ubuntu-24.04` image) and the composite action
`mirurobotics/.github/actions/notify-deploys`, which posts to a Slack webhook;
none is tied to a runner provider or a fixed source address. `licensed.yml` adds
`ruby/setup-ruby` and `licensee/setup-licensed`, which support GitHub-hosted
runners.

When each workflow runs, which decides what the PR itself can prove (the
`workflow_call` triggers in four of them have no caller in this repository):

- `ci.yml`, `check-dist.yml` and `linter.yml`: on `pull_request` to `main` and
  on push to `main`. All their jobs run on the PR.
- `codeql-analysis.yml`: nightly (`cron: '31 7 * * *'`) and `workflow_dispatch`
  only. The `codeql-gate` action skips the scan only on scheduled runs where
  `main` has not moved, so a dispatched run always scans.
- `ai-review.yml`: on `pull_request_target`, which runs the file from the base
  branch. The PR's own AI review still runs on Blacksmith; the new runner takes
  effect on the first PR after merge.
- `release.yml`: on push of a `v*.*.*` tag only. It moves the major and minor
  tags and creates a GitHub release, so it must not be triggered to test this
  change; it is verified on the next real release.
- `licensed.yml`: `workflow_dispatch` only. A dispatched run refreshes
  `.licenses/` and commits and pushes it to the dispatched ref, and its commit
  step fails when nothing changed, so it is not dispatched here; it is verified
  on its next manual run.

## Plan of Work

In the seven files under `.github/workflows/`, replace each
`blacksmith-2vcpu-ubuntu-2404` with
`ubuntu-latest # standard GitHub-hosted runners are free in public repos`,
leaving indentation and every other line untouched. In `actionlint.yml`, delete
the `self-hosted-runner` block (lines 3 to 7) and the empty line after it, which
leaves the `# See:` comment and the `paths` block. One commit, one milestone.

## Concrete Steps

All commands run from the setup-cli repository root, `/home/user/setup-cli`.

Step 1 — confirm the branch and the starting count, and move this plan.

```sh
git branch --show-current   # expect: claude/youthful-lamport-yn0sf2
grep -rc 'blacksmith-' .github/workflows/ actionlint.yml
mkdir -p plans/active
git mv plans/backlog/20261111-github-hosted-runners.md plans/active/
```

Expected counts (in any order):

```text
.github/workflows/ai-review.yml:1
.github/workflows/check-dist.yml:1
.github/workflows/ci.yml:3
.github/workflows/codeql-analysis.yml:2
.github/workflows/licensed.yml:1
.github/workflows/linter.yml:1
.github/workflows/release.yml:3
actionlint.yml:3
```

If every count is 0, the change is already applied; skip to Step 4. If the plan
is already in `plans/active/`, skip the `git mv`.

Step 2 — replace the labels and drop the registrations.

```sh
sed -i 's/runs-on: blacksmith-2vcpu-ubuntu-2404$/runs-on: ubuntu-latest # standard GitHub-hosted runners are free in public repos/' .github/workflows/*.yml
sed -i '/^self-hosted-runner:/,/^$/d' actionlint.yml
```

Step 3 — check the result (read-only inspection, not validation tooling).

```sh
grep -rn 'blacksmith' .github/ actionlint.yml   # expect: no output
grep -rc 'runs-on: ubuntu-latest # standard GitHub-hosted runners are free in public repos' .github/workflows/
cat actionlint.yml
git diff --stat
```

Expected: the second `grep` prints the same counts as Step 1 without the
`actionlint.yml` line, `actionlint.yml` holds only the `# See:` comment and the
`paths` block, and the diff summary reads:

```text
 8 files changed, 12 insertions(+), 18 deletions(-)
```

Step 4 — commit the milestone.

```sh
git add .github/workflows actionlint.yml plans/
git commit -m "ci: run setup-cli workflows on GitHub-hosted ubuntu-latest runners"
```

Step 5 — push and open the draft PR (via `$pr`). In the PR body, link docs#320
and gotools#69, name the agent follow-up, and state which workflows can only be
verified after merge or on the next release.

Step 6 — dispatch CodeQL against the branch, which runs on GitHub.

```sh
gh workflow run codeql-analysis.yml --ref claude/youthful-lamport-yn0sf2
gh run list --workflow codeql-analysis.yml --branch claude/youthful-lamport-yn0sf2 --limit 1
```

Step 7 — run `$preflight` until it reports `CLEAN`, fixing any failure from
`gh run view --log-failed`.

No local `actionlint`, `yamllint`, `super-linter`, npm scripts, builds or tests
are run.

## Validation and Acceptance

The repository has no test suite for workflow configuration, and this change
adds no test. The test is that every touched workflow still runs and passes on
GitHub's runner:

- `ci.yml` on the PR: `unit-tests`, `test-action`, `version-pin-test` and the
  three unchanged `action-test-*` jobs pass, and the "Set up job" section of
  each moved job's log shows a GitHub-hosted runner with image `ubuntu-24.04`,
  not Blacksmith. `test-action` and `version-pin-test` still install and print
  the `miru` version. `unit-tests` runs `npm run format:check`, so it also
  proves the edited YAML and this plan pass Prettier.
- `check-dist.yml` on the PR: `check-dist` passes, since `dist/` is untouched.
- `linter.yml` on the PR: `lint` passes. Its `actionlint` step proves the edited
  workflows and the trimmed `actionlint.yml` are valid: a workflow still using a
  removed Blacksmith label would fail it. Its `yamllint` step may report the new
  lines as line-length warnings without failing.
- `codeql-analysis.yml`: the dispatched run from Step 6 passes `changes` and
  runs `codeql` on `ubuntu-latest`.
- Gate: `$preflight` must report `CLEAN`, meaning CI is green on the pushed
  branch head, before the PR leaves draft.

Verified only after merge, and recorded in Outcomes:

- `ai-review.yml`: the AI review on the next PR after merge runs on
  `ubuntu-latest` and posts its `ai-review` status. The cli repository already
  passes `runs-on: ubuntu-latest` to the same reusable workflow at the same SHA.
- The push runs of `ci.yml`, `check-dist.yml` and `linter.yml` on `main`, and
  the next nightly CodeQL run, pass on `ubuntu-latest`.
- `release.yml`: the next `v*.*.*` tag runs `check-main`, `release` and `notify`
  on `ubuntu-latest`, creates the GitHub release and posts to `#deploys`.
  Nothing in it depends on Blacksmith, but only a real release proves it.
- `licensed.yml`: its next manual run passes the `Check Licenses` job.

## Idempotence and Recovery

Step 2 is safe to rerun; once the labels and the `self-hosted-runner` block are
gone neither `sed` matches anything. Before committing,
`git checkout -- .github/workflows actionlint.yml` restores the files. After
merge, a failure that only `ubuntu-latest` causes is fixed forward in a new PR,
or reverted with `git revert <sha>` in a PR. Never force-push `main`.
