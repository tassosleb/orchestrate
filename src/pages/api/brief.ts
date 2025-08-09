import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }
  // TODO: Generate morning brief by summarizing latest articles and user's KB
  return res.status(200).json({ brief: 'Your morning brief will appear here.' });
}
