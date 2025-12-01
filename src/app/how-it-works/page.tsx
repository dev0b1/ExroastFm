export default function HowItWorksPage() {
  const updated = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">How It Works</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {updated}</p>

      <p className="mb-4 text-sm text-gray-700">ExRoast.buzz delivers short, AI-generated entertainment tracks (typically
        20–45 seconds) created from a simple story you provide. We use automated models to produce the audio—no humans
        listen to your prompt unless you explicitly request a human edit. Everything is delivered as a downloadable MP3/MP4.
        This page explains the process so payment gateways can verify the product being sold.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">What You Buy</h2>
      <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
        <li>An AI-generated audio track (MP3) and optional short video (MP4) matching the chosen style.</li>
        <li>Typical length: 20–45 seconds. Exact duration shown on the product page.</li>
        <li>License: personal use and sharing allowed; resale or redistribution is prohibited.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Step-by-step</h2>
      <ol className="list-decimal list-inside ml-6 mb-4 text-sm text-gray-700 space-y-2">
        <li>Choose a style or template (e.g., Petty Pop, Savage Trap).</li>
        <li>Enter a short story and optional details (name, short anecdote). Keep it non-threatening and fun.</li>
        <li>Pay via our secure checkout. Payments handled by Paddle—no card data is stored on our servers.</li>
        <li>Our system generates the track automatically and provides a download link on the purchase page and by email.</li>
      </ol>

      <h2 className="text-lg font-semibold mt-6 mb-2">Safety & Moderation</h2>
      <p className="mb-4 text-sm text-gray-700">We prohibit content that promotes hate, violence, or harassment. Submissions
        are checked automatically for disallowed language. We reserve the right to refuse or remove content that violates
        our Acceptable Use Policy.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">No Human Listening</h2>
      <p className="mb-4 text-sm text-gray-700">Content is created automatically by AI models. We do not route prompts
        to humans for review during normal generation. Human review only occurs when you request manual edits or when
        moderation flags a prompt for review.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Quick Content Template (copy/paste & tweak)</h2>
      <p className="mb-2 text-sm text-gray-700">Use this template to craft your story. Keep it short (1–3 sentences):</p>
      <pre className="bg-gray-900 text-white p-3 rounded text-sm">"Make a 30s Petty Pop track about my ex, NAME, who left me for texting their coworker. Make it funny, playful, and light-hearted. Include the line: 'They couldn't handle the heat.'"</pre>

      <p className="mt-4 text-sm text-gray-700">Tips: avoid real threats, do not include protected characteristics, and keep it comedic.
        If your prompt is rejected, try softening language or removing identifying info.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Where to Link It</h2>
      <p className="mb-4 text-sm text-gray-700">Add links to this page from the site navigation, product/checkout pages,
        and the footer so payment reviewers can see a clear product explanation.</p>
    </div>
  );
}
