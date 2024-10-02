import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAffiliateApi } from 'src/hooks/useAffiliateApi';
import { useAuth } from 'src/providers/AuthProvider';

export const ReferralWatcher = () => {
  const [URLSearchParams] = useSearchParams();
  const { loggedIn } = useAuth();
  const { submitRefCode } = useAffiliateApi();

  useEffect(() => {
    const type = URLSearchParams.get('ref-type') || localStorage.getItem('ref-type');
    const code = URLSearchParams.get('ref-code') || localStorage.getItem('ref-code');

    if (type && code && !loggedIn) {
      localStorage.setItem('ref-type', type);
      localStorage.setItem('ref-code', code);
    }

    if (type && code && loggedIn) {
      submitRefCode(code).then(() => {
        localStorage.removeItem('ref-type');
        localStorage.removeItem('ref-code');
      });
    }
  }, [loggedIn, URLSearchParams]);

  return null;
};
