export default function PrivacyPage() {
  const updated = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {updated}</p>

      <p className="mb-4">
        This Privacy Policy explains how Exroast.fm ("we", "us", "the Service") collects, uses,
        and shares information when you use our website and services. Our goal is to collect only the
        information necessary to provide the product and to protect our users.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
        <li>Account information: email and any profile details you provide when you sign up.</li>
        <li>Payment data: when you make a purchase we store transaction metadata (payment provider
          reference, amount, and purchase timestamp). We do not store full payment card numbers.</li>
        <li>Content you provide: the short story, names, or prompts you submit to generate content.</li>
        <li>Technical logs: IP address, browser and device information, and usage metrics for
          debugging and analytics.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">How We Use Information</h2>
      <p className="mb-4 text-sm text-gray-700">We use the information we collect to:</p>
      <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
        <li>Deliver purchased digital goods and previews.</li>
        <li>Process payments and prevent fraud (via third-party payment processors).</li>
        <li>Improve the Service and tailor the user experience.</li>
        <li>Comply with legal obligations and respond to support requests.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Third-Party Services</h2>
      <p className="mb-4 text-sm text-gray-700">We rely on third-party providers for payments, hosting, and analytics. These
        providers may receive limited data needed to perform their services (for example, payment
        processors receive transaction details). Please review the privacy policies of those providers.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Payments and Refunds</h2>
      <p className="mb-4 text-sm text-gray-700">Payments are processed by third-party gateways (for example, Paddle).
        We retain transaction metadata (provider reference, amount, date) to support refunds and disputes.
        Our Refund Policy is available at <a href="/refund-policy" className="text-blue-600 underline">/refund-policy</a>.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Data Retention and Security</h2>
      <p className="mb-4 text-sm text-gray-700">We retain account and transaction data as long as necessary to provide the
        Service and to comply with legal obligations. We apply industry-standard security practices to protect
        your data but cannot guarantee absolute security.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">GDPR / CCPA and Deletion Requests</h2>
      <p className="mb-4 text-sm text-gray-700">If you are located in the EU or California, you have rights under
        GDPR/CCPA to access, correct, or delete personal data. To request deletion of your account or any
        user-submitted content (for example, a roast that includes a name), email <a
        href="mailto:legal@exroast.fm" className="text-blue-600 underline">legal@exroast.fm</a> and we will
        respond within 30 days. Note that removing an item may not affect copies already downloaded by users.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Children</h2>
      <p className="mb-4 text-sm text-gray-700">The Service is not intended for children under 13. We do not knowingly
        collect personal information from children.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Content Disclaimer</h2>
      <p className="mb-4 text-sm text-gray-700"><strong>Content is user-generated humor; we don't endorse negativity.</strong>
        Users are responsible for the content they submit and must not use the Service to harass, threaten,
        or defame others.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Changes</h2>
      <p className="mb-4 text-sm text-gray-700">We may update this policy periodically. When material changes occur
        we will post the updated date at the top of this page.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-sm text-gray-700">If you have questions about this policy, contact <a
        href="mailto:legal@exroast.fm" className="text-blue-600 underline">legal@exroast.fm</a>.</p>
    </div>
  );
}
