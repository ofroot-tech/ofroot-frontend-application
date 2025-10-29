# Workflow Documentation

## Delete Obsolete Branches

The `delete-branches.yml` workflow is designed to remove obsolete branches from the repository.

### Branches to be Deleted
- `adding-database`
- `feat/recurring-invoices-and-service-pages`

### How to Run

This workflow can be triggered manually via the GitHub Actions UI:

1. Go to the **Actions** tab in the GitHub repository
2. Select **Delete Obsolete Branches** from the workflows list
3. Click **Run workflow**
4. Select the branch (usually `main`) and click **Run workflow**

The workflow will:
- Check if each branch exists
- Delete the branch if it exists
- List all remaining branches after deletion

### Permissions

The workflow requires:
- `contents: write` permission (configured in the workflow file)
- User triggering the workflow must have write access to the repository

### Expected Outcome

After successful execution, only the `main` branch and any active PR branches should remain in the repository.
