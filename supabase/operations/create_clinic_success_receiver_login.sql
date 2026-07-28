\set ON_ERROR_STOP on

-- Operational credential bootstrap.
-- The password must be supplied only through the `receiver_password` psql
-- variable by the invoking secret-management wrapper.
-- It is never stored in this repository or in the Supabase migration ledger.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'clinic_success_receiver_login'
  ) THEN
    CREATE ROLE clinic_success_receiver_login
      LOGIN
      INHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS
      CONNECTION LIMIT 8;
  END IF;
END
$$;

ALTER ROLE clinic_success_receiver_login
  LOGIN
  INHERIT
  CONNECTION LIMIT 8;
ALTER ROLE clinic_success_receiver_login SET statement_timeout = '15s';
ALTER ROLE clinic_success_receiver_login SET idle_in_transaction_session_timeout = '15s';

\if :{?receiver_password}
\else
  \echo 'receiver_password psql variable is required'
  \quit 3
\endif

SELECT format(
  'ALTER ROLE clinic_success_receiver_login PASSWORD %L',
  :'receiver_password'
) \gexec

GRANT clinic_success_receiver TO clinic_success_receiver_login;
