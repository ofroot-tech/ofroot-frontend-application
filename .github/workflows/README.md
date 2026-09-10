# Branch Deletion Tools

This directory contains tools for deleting obsolete branches from the repository.

## Methods to Delete Branches

### Method 1: GitHub Actions Workflow (Recommended)

The `delete-branches.yml` workflow can be triggered manually via the GitHub Actions UI:

1. Go to the **Actions** tab in the GitHub repository
2. Select **Delete Obsolete Branches** from the workflows list
3. Click **Run workflow**
4. Select the branch (usually `main`) and click **Run workflow**

### Method 2: Shell Script

Run the `delete-obsolete-branches.sh` script from the `scripts` directory:

```bash
cd /path/to/ofroot-frontend-application
./scripts/delete-obsolete-branches.sh
```

The script will prompt for confirmation before deleting branches.

## Branches to be Deleted

- `adding-database`
- `feat/recurring-invoices-and-service-pages`

## Requirements

- Write access to the repository
- Authentication credentials (GitHub token or SSH key) configured in your local git environment

## Expected Outcome

After successful execution, only the `main` branch and any active PR branches should remain in the repository.
