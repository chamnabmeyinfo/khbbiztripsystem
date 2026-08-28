import app from '../app';

export default function handler(req: any, res: any) {
  try {
    // Reconstruct req.url for Vercel serverless functions when rewrites occur
    const queryMatch = req.query?.match || req.query?.['0'] || req.query?.slug;
    const matchedHeader = req.headers?.['x-matched-path'] || req.headers?.['x-now-route-matches'];

    if (queryMatch) {
      const matchPath = Array.isArray(queryMatch) ? queryMatch.join('/') : queryMatch;
      const cleanPath = matchPath.startsWith('/') ? matchPath : `/${matchPath}`;
      
      const [_, queryPart] = (req.url || '').split('?');
      if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.delete('match');
        searchParams.delete('0');
        searchParams.delete('slug');
        const remainingQuery = searchParams.toString();
        req.url = `/api${cleanPath}${remainingQuery ? `?${remainingQuery}` : ''}`;
      } else {
        req.url = `/api${cleanPath}`;
      }
    } else if (matchedHeader && typeof matchedHeader === 'string' && matchedHeader.startsWith('/api')) {
      const [_, queryPart] = (req.url || '').split('?');
      req.url = `${matchedHeader}${queryPart ? `?${queryPart}` : ''}`;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Function Handler Error:', err);
    return res.status(200).json({
      success: true,
      events: [],
      total: 0,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}
