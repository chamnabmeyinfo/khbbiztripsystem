# Custom Instructions

- **Mandatory GitHub Update Pre-Check**: At the start of EVERY turn/task before performing any code modifications or processing requests, you MUST ALWAYS check for new remote updates from the GitHub repository (`https://github.com/chamnabmeyinfo/khbbiztripsystem.git`) on `origin/main`. If any new commits or updates are found on the remote repository, you MUST pull and merge the latest updates first (`git pull --rebase origin main`) before proceeding with any other task.
- **Pre-Review Quality, Anti-Crash & State Persistence Verification**: Every time before presenting work or sending changes to the user for review, you MUST test, double-check, and triple-check all modified files and code paths. Always ensure:
  1. Complete state persistence across page refreshes (LocalStorage & Cloud Firestore two-way sync).
  2. Zero Firestore write crashes (all payloads strictly sanitized with no `undefined` values).
  3. No hardcoded mock/seed templates overriding active user edits in state.
  4. Always execute linting and compilation checks (`npm run lint` and `npm run build`) to guarantee zero syntax errors, no missing or broken imports, valid React hook usages, and that the application will not crash.
- **Detailed Exact Update Reporting**: In every response presenting completed work, updates, or fixes, you MUST report the exact things that were updated, including:
  1. The exact filenames and clickable markdown links with line ranges.
  2. The precise root cause or requirement addressed.
  3. The exact code logic/fields changed, added, or removed.
  4. Clear verification results confirming that the changes were tested and work as expected.
- **Git Push Notification & Execution**: Whenever you finish implementing, updating, or fixing any features in the codebase, always explicitly ask the user whether they would like you to push the latest changes to their GitHub repository (`https://github.com/chamnabmeyinfo/khbbiztripsystem.git`) using their `GITHUB_TOKEN`.
- **Git Command Permissions**: Whenever running commands related to Git and GitHub (including `git status`, `git add`, `git commit`, `git push`, `git pull`, `git fetch`, `git diff`, etc.), always automatically proceed and execute them directly without hesitation.
