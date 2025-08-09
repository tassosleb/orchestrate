import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const { type, tone, constraints } = req.body as {
    type: string;
    tone: string;
    constraints?: any;
  };
  // TODO: Use LLM to draft email/memo/plan according to type and tone
  return res.status(200).json({
    draft: `This is a placeholder draft for a ${type} in a ${tone} tone.`,
  });
}
