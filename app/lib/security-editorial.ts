import { SECURITY_GUIDE, SECURITY_NEWS } from './application-security-content';
import { ACCOUNT_RECOVERY_GUIDE, SMS_PHISHING_NEWS } from './security-editorial-20261118';
import { OPTIMIZELY_NEWS, THIRD_PARTY_SCRIPT_GUIDE } from './security-editorial-20261119';

// Published articles only; keep the visible indexes and their schema aligned.
export const SECURITY_EDITORIAL_NEWS = [OPTIMIZELY_NEWS, SMS_PHISHING_NEWS, SECURITY_NEWS];
export const SECURITY_EDITORIAL_GUIDES = [THIRD_PARTY_SCRIPT_GUIDE, ACCOUNT_RECOVERY_GUIDE, SECURITY_GUIDE];
