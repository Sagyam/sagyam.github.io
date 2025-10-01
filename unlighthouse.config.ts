export default {
  site: process.env.UNLIGHTHOUSE_SITE_URL || 'https://sagyamthapa.com.np',
  ci: {
    budget: {
      performance: 75,
      accessibility: 90,
      'best-practices': 85,
      seo: 90,
    },
  },
  scanner: {
    // Throttle concurrent scans to avoid overwhelming the server
    maxRoutes: 50,
    throttle: true,
  },
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};
