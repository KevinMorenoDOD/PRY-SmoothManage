import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Route {
  path: string;
  element: React.ReactNode;
  children?: Route[];
}

export interface RouterContextValue {
  location: Location;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  routes: Route[];
}

const RouterContext = createContext<RouterContextValue | null>(null);

export const useRouter = (): RouterContextValue => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export interface RouterProviderProps {
  routes: Route[];
  basename?: string;
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({
  routes,
  basename = '',
  children,
}) => {
  const [location, setLocation] = useState<Location>(window.location);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    const fullPath = basename ? `${basename}${path}` : path;
    if (options?.replace) {
      window.history.replaceState({}, '', fullPath);
    } else {
      window.history.pushState({}, '', fullPath);
    }
    setLocation(window.location);
  }, [basename]);

  useEffect(() => {
    const handlePopState = () => setLocation(window.location);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value: RouterContextValue = {
    location,
    navigate,
    routes,
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const useLocation = (): Location => {
  return useRouter().location;
};

export const useNavigate = (): RouterContextValue['navigate'] => {
  return useRouter().navigate;
};

export const Link: React.FC<{ to: string; replace?: boolean; children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  to,
  replace = false,
  children,
  className = '',
  style,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer', ...style }}
    >
      {children}
    </a>
  );
};

const matchPath = (pathname: string, pattern: string): { match: boolean; params: Record<string, string> } => {
  const regexPattern = pattern
    .replace(/\/:([^/]+)/g, '/(?<params$1>[^/]+)')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  const match = pathname.match(regex);
  if (!match) return { match: false, params: {} };
  return { match: true, params: match.groups ?? {} };
};

export const Routes: React.FC<{ routes: Route[]; basename?: string }> = ({ routes, basename = '' }) => {
  const { location } = useRouter();
  const pathname = basename ? location.pathname.slice(basename.length) : location.pathname;

  const matchRoute = (route: Route, path: string): React.ReactNode | null => {
    const { match, params } = matchPath(path, route.path);
    if (!match) return null;

    if (route.children) {
      for (const child of route.children) {
        const matched = matchRoute(child, path);
        if (matched) return matched;
      }
      return null;
    }

    return React.cloneElement(route.element as React.ReactElement, { params });
  };

  for (const route of routes) {
    const matched = matchRoute(route, pathname);
    if (matched) return <>{matched}</>;
  }

  return null;
};

export const Outlet: React.FC = () => {
  return <Routes routes={useRouter().routes} />;
};