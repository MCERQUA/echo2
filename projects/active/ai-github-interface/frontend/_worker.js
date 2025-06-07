// Redirect to the correct worker file
// This file exists only to prevent Cloudflare deployment errors
// The actual worker is at: functions/_worker.js
export default {
  fetch: () => new Response('Worker moved to functions/_worker.js', { status: 404 })
}