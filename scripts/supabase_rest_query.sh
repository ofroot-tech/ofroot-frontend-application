#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/supabase_rest_query.sh <table> [select] [filter]" >&2
  echo "Example: scripts/supabase_rest_query.sh ofroot_auth_users \"id,email\" \"email=eq.test@example.com\"" >&2
  exit 1
fi

TABLE="$1"
SELECT="${2:-*}"
FILTER="${3:-}"
VERCEL_ENV_NAME="${VERCEL_ENV:-production}"

TMP_ENV_FILE="$(mktemp -u /tmp/vercel-supa-env.XXXXXX)"
vercel env pull "$TMP_ENV_FILE" --yes --environment="$VERCEL_ENV_NAME" >/dev/null

SUPABASE_URL="$(rg '^NEXT_PUBLIC_SUPABASE_URL=' "$TMP_ENV_FILE" | sed 's/^NEXT_PUBLIC_SUPABASE_URL=//' | sed 's/^"//' | sed 's/"$//')"
SERVICE_ROLE_KEY="$(rg '^SUPABASE_SERVICE_ROLE_KEY=' "$TMP_ENV_FILE" | sed 's/^SUPABASE_SERVICE_ROLE_KEY=//' | sed 's/^"//' | sed 's/"$//')"

if [[ -z "$SUPABASE_URL" || -z "$SERVICE_ROLE_KEY" ]]; then
  echo "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in $VERCEL_ENV_NAME env" >&2
  exit 1
fi

URL="$SUPABASE_URL/rest/v1/$TABLE?select=$SELECT"
if [[ -n "$FILTER" ]]; then
  URL="$URL&$FILTER"
fi

curl -sS "$URL" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Accept: application/json"

echo
