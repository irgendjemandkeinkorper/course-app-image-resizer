# Contributing

Course App Resizer is a static, single-file browser app. There is no build step; changes to the runtime normally belong in `index.html` and should preserve the existing Greensward tokens and behavior.

Before starting work, synchronize with the current base:

```sh
git fetch origin
git log master..origin/master
```

Run the local checks before opening a pull request:

```sh
npm ci
npm run lint
```

Use the pull-request template to describe the behavior changed and the verification performed. Pull requests targeting `master` run the lint and runtime smoke checks in GitHub Actions; repository branch protection should require those checks before merging.

Keep commits small and focused. Do not edit `design_handoff_course_app_resizer/` when changing the live app; that directory is a reference snapshot.
