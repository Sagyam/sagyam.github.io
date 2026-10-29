'use client';

import dynamic from 'next/dynamic';

/*
 * Every interactive figure a post can use, by the name it's written as in MDX.
 *
 * Each entry is its own lazy chunk: a post downloads only the figures it renders, and code shared
 * between them (./shared) is split out once. Add new figures here, grouped by post; never import
 * them statically from the MDX renderer, or they'd ship to every post.
 */
export const interactiveComponents = {
  // An Interactive Guide to Bloom Filter
  BloomPlayground: dynamic(() =>
    import('./bloom-filter/playground').then((m) => m.BloomPlayground)
  ),
  BloomTuner: dynamic(() => import('./bloom-filter/tuner').then((m) => m.BloomTuner)),

  // An Interactive Guide to HyperLogLog
  HllAnatomy: dynamic(() => import('./hyperloglog/anatomy').then((m) => m.HllAnatomy)),
  HllPlayground: dynamic(() => import('./hyperloglog/playground').then((m) => m.HllPlayground)),

  // An Interactive Guide to Count-Min Sketch
  CmsExplorer: dynamic(() => import('./count-min-sketch/explorer').then((m) => m.CmsExplorer)),
  CmsStream: dynamic(() => import('./count-min-sketch/stream').then((m) => m.CmsStream)),

  // An Interactive Guide To Rate Limiting
  TokenBucketDemo: dynamic(() => import('./rate-limiting/demos').then((m) => m.TokenBucketDemo)),
  LeakyBucketDemo: dynamic(() => import('./rate-limiting/demos').then((m) => m.LeakyBucketDemo)),
  FixedWindowDemo: dynamic(() => import('./rate-limiting/demos').then((m) => m.FixedWindowDemo)),
  SlidingWindowDemo: dynamic(() =>
    import('./rate-limiting/demos').then((m) => m.SlidingWindowDemo)
  ),
  RateLimiterComparison: dynamic(() =>
    import('./rate-limiting/compare').then((m) => m.RateLimiterComparison)
  ),

  // An Interactive Guide to Caching Strategies
  CacheAsideDemo: dynamic(() => import('./caching/simulator').then((m) => m.CacheAsideDemo)),
  ReadThroughDemo: dynamic(() => import('./caching/simulator').then((m) => m.ReadThroughDemo)),
  WriteThroughDemo: dynamic(() => import('./caching/simulator').then((m) => m.WriteThroughDemo)),
  WriteBackDemo: dynamic(() => import('./caching/simulator').then((m) => m.WriteBackDemo)),
  WriteAroundDemo: dynamic(() => import('./caching/simulator').then((m) => m.WriteAroundDemo)),
  RefreshAheadDemo: dynamic(() => import('./caching/simulator').then((m) => m.RefreshAheadDemo)),
};
