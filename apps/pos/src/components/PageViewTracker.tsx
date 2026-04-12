import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';

export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    track('pageview', {
      path: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);

  return null;
}
