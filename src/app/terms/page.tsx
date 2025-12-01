export default function TermsPage() {
  const updated = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {updated}</p>

      <p className="mb-4 text-sm text-gray-700">These Terms of Service ("Terms") govern your use of ExRoast.buzz (the "Service").
        By accessing or using the Service you agree to these Terms. If you do not agree, do not use the Service.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Services</h2>
      <p className="mb-4 text-sm text-gray-700">The Service provides short, user-generated audio tracks and related
        digital goods based on user-provided prompts. We may change or discontinue features at any time.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Merchant & Business Information</h2>
          <p className="mb-4 text-sm text-gray-700">Merchant name: <strong>Opencipher Tech</strong> (brand: ExRoast). Business/Legal name: <strong>Opencipher Tech</strong>.
            Registered address: <strong>NO. 4 Mc Dermott Road, Warri, Delta State, Nigeria</strong>. Contact email for legal and billing matters:
            <a href="mailto:legal@exroast.buzz" className="text-blue-600 underline">legal@exroast.buzz</a>.
            Please verify these details in your Paddle account and update any corporate filings as needed.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Delivery & Licensing</h2>
          <p className="mb-4 text-sm text-gray-700">Digital goods are delivered instantly after successful payment as a
            download link and optional email. License: personal, non-commercial use only. Redistribution, resale, or
            sublicensing of tracks is prohibited without express written permission.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Taxes and VAT</h2>
          <p className="mb-4 text-sm text-gray-700">Prices may include applicable taxes where required; in some
            jurisdictions taxes (such as VAT) will be calculated and collected during checkout by our payment
            processor. You are responsible for any taxes associated with your purchase unless otherwise stated.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Accounts</h2>
      <p className="mb-4 text-sm text-gray-700">You are responsible for maintaining the confidentiality of your account
        credentials and for all activity that occurs under your account.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Payments and Refunds</h2>
      <p className="mb-4 text-sm text-gray-700">Certain features or digital goods require payment. Payments are processed
        by third-party providers. All sales are subject to our Refund Policy available at
        <a href="/refund-policy" className="text-blue-600 underline"> /refund-policy</a>. We reserve the right to
        refuse or cancel orders at our discretion.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">User Conduct</h2>
      <p className="mb-4 text-sm text-gray-700">You agree not to use the Service to upload, post, email, or otherwise
        transmit content that is unlawful, defamatory, harassing, abusive, invasive of privacy, or otherwise objectionable.
        <strong>Content is user-generated humor; we don't endorse negativity.</strong></p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Intellectual Property</h2>
      <p className="mb-4 text-sm text-gray-700">You retain ownership of content you submit. By submitting content you grant
        us a limited, non-exclusive license to host, use, and display the content for the purpose of providing the Service.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Disclaimers and Limitation of Liability</h2>
      <p className="mb-4 text-sm text-gray-700">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE
        MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Indemnity</h2>
      <p className="mb-4 text-sm text-gray-700">You agree to indemnify and hold harmless ExRoast.buzz from any claims,
        liabilities, damages, losses, and expenses arising out of your use of the Service or violation of these Terms.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Governing Law</h2>
      <p className="mb-4 text-sm text-gray-700">These Terms are governed by the laws of the jurisdiction where ExRoast.buzz
        is operated, without regard to conflict of law principles.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Changes</h2>
      <p className="mb-4 text-sm text-gray-700">We may update these Terms from time to time. We will post the updated
        date at the top of this page. Continued use of the Service after changes constitutes acceptance.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-sm text-gray-700">For legal questions contact <a href="mailto:legal@exroast.buzz" className="text-blue-600 underline">legal@exroast.buzz</a>.</p>
    </div>
  );
}
