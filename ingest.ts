import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Create a supabase client with service role key for uploads. The service role
// key should only be used server-side. It grants write access to storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  // Parse the incoming form
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }
    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const fileStream = fs.createReadStream(file.filepath);
      const fileName = `${Date.now()}_${file.originalFilename}`;
      // Upload file to Supabase Storage (bucket must exist)
      const { data, error } = await supabase.storage
        .from('knowledge-base')
        .upload(fileName, fileStream as any);
      if (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
      }
      // TODO: Extract text, chunk, embed with OpenAI, and store in pgvector table
      return res.status(200).json({ message: 'Uploaded successfully', path: data?.path });
    } catch (uploadErr) {
      console.error(uploadErr);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}