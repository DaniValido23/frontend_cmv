import React, { Suspense, type ComponentType, type ReactNode } from "react";
import Spinner from "@/components/ui/Spinner";

interface LazyComponentLoaderProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export default function LazyComponentLoader({
  fallback,
  children
}: LazyComponentLoaderProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}


export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = React.lazy(importFn);

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <LazyComponentLoader fallback={fallback}>
        <LazyComponent {...props} />
      </LazyComponentLoader>
    );
  };
}
