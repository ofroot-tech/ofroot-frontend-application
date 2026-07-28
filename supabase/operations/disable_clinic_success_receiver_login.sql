\set ON_ERROR_STOP on

-- Emergency credential rollback. This preserves the event ledger and schema.
REVOKE clinic_success_receiver FROM clinic_success_receiver_login;
ALTER ROLE clinic_success_receiver_login NOLOGIN;
