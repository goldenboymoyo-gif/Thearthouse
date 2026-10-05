// Runs the Express backend (/backend) inside the website's own Vercel
// project, so /api/* works without deploying anything separately.
// (If BACKEND_URL is set, next.config.js forwards /api/* to a separately
// deployed backend instead and this file is not used.)
import backend from '../../backend/src/index';

export const config = {
  api: {
    bodyParser: false, // Express reads the request body itself
    responseLimit: false,
    externalResolver: true, // Express sends the response
  },
  maxDuration: 20, // seconds – no request can hold a function open longer
};

export default function handler(req, res) {
  return backend(req, res);
}
