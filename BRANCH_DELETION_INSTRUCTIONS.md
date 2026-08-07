# Branch Deletion Instructions

## Objective

Delete the following obsolete branches from the repository:
- `adding-database`
- `feat/recurring-invoices-and-service-pages`

Keep only the `main` branch (and active PR branches).

## Available Tools

This PR provides two methods to accomplish the branch deletion:

### Option 1: GitHub Actions Workflow (Recommended)

A GitHub Actions workflow has been created at `.github/workflows/delete-branches.yml`.

**How to use:**
1. After this PR is merged, go to the repository's **Actions** tab
2. Select **Delete Obsolete Branches** from the workflows list
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow** to execute

The workflow will automatically:
- Check if each branch exists
- Delete existing branches
- Display the remaining branches

### Option 2: Local Shell Script

A shell script has been created at `scripts/delete-obsolete-branches.sh`.

**How to use:**
```bash
# Clone the repository (if not already cloned)
git clone https://github.com/ofroot-tech/ofroot-frontend-application.git
cd ofroot-frontend-application

# Ensure you're authenticated (GitHub CLI or SSH)
# Then run the script:
./scripts/delete-obsolete-branches.sh
```

The script will:
- Prompt for confirmation
- Delete both branches if they exist
- Show the remaining branches

## Why Not Deleted Automatically?

Branch deletion is a privileged operation that requires:
- Write access to the repository
- Proper authentication credentials

The automated GitHub Copilot environment has restricted permissions and cannot directly delete remote branches. Therefore, the deletion must be performed by an authorized user using one of the tools provided in this PR.

## Verification

After running either method, you can verify the deletion by checking:

```bash
git ls-remote --heads origin
```

Or by viewing the branches in the GitHub UI under the repository's **Branches** page.

Only the `main` branch (and any active PR branches) should remain.
