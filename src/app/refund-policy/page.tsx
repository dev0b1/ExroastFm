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

      <p className="mb-4 text-sm text-gray-700">We offer a straightforward refund policy to minimize disputes and
        chargebacks. If your track fails to generate, is corrupt, or otherwise unusable, contact us and we'll
        remake it or issue a refund. Our policy is:</p>

      <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
        <li>30-day money-back guarantee for eligible purchases.</li>
        <li>For technical issues or unusable files, we will attempt to fix or remake the asset before issuing
          a refund.</li>
        <li>To request a refund, email <strong>support@exroast.buzz</strong> with your order ID and a short
          description of the issue. We aim to respond within 48 hours.</li>
      </ul>

      <p className="mb-4">
        <strong>Content is user-generated humor; we don't endorse negativity.</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How to request a refund</h2>
      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
        <li>Contact support at <strong>support@exroast.buzz</strong> with your order ID and issue description.</li>
        <li>We will investigate and attempt to resolve the issue or remake the asset.</li>
        <li>If a refund is approved, we will process it via Paddle and notify you by email. Refunds typically
          appear within 5-10 business days depending on the payment provider.</li>
      </ol>
    </div>
  );
}
