import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const { query } = req.body as { query: string };
  if (!query) {
    return res.status(400).json({ error: 'Query missing' });
  }
  // TODO: Perform vector search using pgvector and return answer
  // For now, echo the query
  return res.status(200).json({ answer: `You asked: ${query}` });
}
