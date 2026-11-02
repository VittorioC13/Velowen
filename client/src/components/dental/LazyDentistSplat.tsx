import { Suspense, lazy, type ComponentProps } from "react";

// three.js is only needed for this scene, so it loads in its own chunk and
// never delays the footage montage.
const Scene = lazy(() => import("./DentistSplat").then((m) => ({ default: m.DentistSplat })));

export function LazyDentistSplat(props: ComponentProps<typeof Scene>) {
  return (
    <Suspense fallback={<div className={props.className} />}>
      <Scene {...props} />
    </Suspense>
  );
}
