export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {new Date().toISOString().split('T')[0]}</p>

      <p className="mb-4">
        We want you to be happy with your purchase. If you experience technical issues that prevent access to
        the service, please contact support at <strong>hello@example.com</strong> and we will work to resolve the
        issue promptly.
      </p>

      <p className="mb-4">
        For purchases processed through Paddle, refunds are handled according to Paddle's policies. If you believe
        you are eligible for a refund, please reach out to us within 14 days of purchase with your order details.
      </p>

      <p className="mb-4">
        <strong>Content is user-generated humor; we don't endorse negativity.</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How to request a refund</h2>
      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
        <li>Contact support at <strong>hello@example.com</strong> with your order ID and issue description.</li>
        <li>We will investigate and attempt to resolve the issue.</li>
        <li>If a refund is approved, we will process it via Paddle and notify you by email.</li>
      </ol>
    </div>
  );
}
