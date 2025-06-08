// pages/api/socket.ts
import { NextApiRequest } from 'next';
import { getIO, NextApiResponseWithSocket } from '../../lib/socket';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const io = getIO(res);
  
  if (!io) {
    console.error('Socket.IO server not initialized');
    return res.status(500).json({ error: 'Socket.IO server not initialized' });
  }

  console.log('Socket.IO server is running');
  
  res.status(200).json({ success: true, message: 'Socket.IO server is running' });
}
