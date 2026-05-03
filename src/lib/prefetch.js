export function prefetchHomeFeeds(prefetch) {
  return Promise.allSettled([
    prefetch(['live'], async () => {
      const module = await import('./api');
      return module.queryFns.live();
    }),
    prefetch(['events'], async () => {
      const module = await import('./api');
      return module.queryFns.events();
    }),
    prefetch(['sermons'], async () => {
      const module = await import('./api');
      return module.queryFns.sermons();
    }),
  ]);
}
