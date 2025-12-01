export default function TermsPage() {
  const updated = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {updated}</p>

      <p className="mb-4 text-sm text-gray-700">These Terms of Service ("Terms") govern your use of Exroast.fm (the "Service").
        By accessing or using the Service you agree to these Terms. If you do not agree, do not use the Service.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Services</h2>
      <p className="mb-4 text-sm text-gray-700">The Service provides short, user-generated audio tracks and related
        digital goods based on user-provided prompts. We may change or discontinue features at any time.</p>

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
      <p className="mb-4 text-sm text-gray-700">You agree to indemnify and hold harmless Exroast.fm from any claims,
        liabilities, damages, losses, and expenses arising out of your use of the Service or violation of these Terms.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Governing Law</h2>
      <p className="mb-4 text-sm text-gray-700">These Terms are governed by the laws of the jurisdiction where Exroast.fm
        is operated, without regard to conflict of law principles.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Changes</h2>
      <p className="mb-4 text-sm text-gray-700">We may update these Terms from time to time. We will post the updated
        date at the top of this page. Continued use of the Service after changes constitutes acceptance.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-sm text-gray-700">For legal questions contact <a href="mailto:legal@exroast.fm" className="text-blue-600 underline">legal@exroast.fm</a>.</p>
    </div>
  );
}
