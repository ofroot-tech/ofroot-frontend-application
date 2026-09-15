#!/bin/bash
# Script to delete obsolete branches from the repository
# Usage: ./delete-obsolete-branches.sh

set -e

echo "This script will delete the following branches from the remote repository:"
echo "  - adding-database"
echo "  - feat/recurring-invoices-and-service-pages"
echo ""
echo "This action cannot be undone. Make sure you have proper authorization."
echo ""
read -r -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Deleting branches..."

# Delete adding-database branch
if git ls-remote --heads origin adding-database | grep adding-database > /dev/null; then
    echo "Deleting branch: adding-database"
    git push origin --delete adding-database
    echo "✓ Branch 'adding-database' deleted successfully"
else
    echo "⚠ Branch 'adding-database' does not exist"
fi

# Delete feat/recurring-invoices-and-service-pages branch
if git ls-remote --heads origin feat/recurring-invoices-and-service-pages | grep feat/recurring-invoices-and-service-pages > /dev/null; then
    echo "Deleting branch: feat/recurring-invoices-and-service-pages"
    git push origin --delete feat/recurring-invoices-and-service-pages
    echo "✓ Branch 'feat/recurring-invoices-and-service-pages' deleted successfully"
else
    echo "⚠ Branch 'feat/recurring-invoices-and-service-pages' does not exist"
fi

echo ""
echo "Operation completed. Remaining branches:"
git ls-remote --heads origin
