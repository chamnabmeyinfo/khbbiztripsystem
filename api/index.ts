import app from '../app';

export default function handler(req: any, res: any) {
  try {
    // If Vercel rewrote /api/:match* to /api, reconstruct req.url so Express routes match correctly
    if (req.query && req.query.match) {
      const matchPath = Array.isArray(req.query.match)
        ? req.query.match.join('/')
        : req.query.match;
      
      const [_, queryPart] = (req.url || '').split('?');
      if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.delete('match');
        const remainingQuery = searchParams.toString();
        req.url = `/api/${matchPath}${remainingQuery ? `?${remainingQuery}` : ''}`;
      } else {
        req.url = `/api/${matchPath}`;
      }
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Function Handler Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Vercel Serverless Execution Error',
      message: err?.message || String(err)
    });
  }
}
