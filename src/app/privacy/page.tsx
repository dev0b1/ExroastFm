export default function PrivacyPage() {
  const updated = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {updated}</p>

      <p className="mb-4">
        This Privacy Policy explains how ExRoast.buzz ("we", "us", "the Service") collects, uses,
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

      <h2 className="text-lg font-semibold mt-6 mb-2">GDPR / CCPA — Your Rights and How We Handle Personal Data</h2>
      <p className="mb-4 text-sm text-gray-700">We take privacy and regulatory compliance seriously. Below is a clear summary
        of how we handle personal data for users in the EU (GDPR) and California (CCPA). If you have additional questions
        or would like to make a rights request, contact us at <a href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a>.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">What personal data we process</h3>
      <p className="mb-4 text-sm text-gray-700">When you use ExRoast.buzz we may collect or process the following categories of personal data:
      user account email and profile fields, the short story or content you submit to generate a roast (which may include names or other personal details you choose to provide), transaction metadata (payment provider reference, amount, date), and technical logs (IP address, browser/user-agent, timestamps) used for fraud prevention and diagnostics.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Lawful basis for processing (GDPR)</h3>
      <p className="mb-4 text-sm text-gray-700">Our primary lawful basis for processing your submitted content is <strong>consent</strong> — you voluntarily provide the short story/inputs used to generate content. For transactional data (payments) and fraud prevention we rely on legitimate interests and contractual necessity to fulfil purchases. If you create an account, processing of account-related data is necessary to provide the service and support.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Your rights (GDPR & CCPA)</h3>
      <ul className="list-disc ml-6 mb-4 text-sm text-gray-700">
        <li><strong>Access:</strong> Request a copy of personal data we hold about you.</li>
        <li><strong>Rectification:</strong> Ask us to correct inaccurate personal data.</li>
        <li><strong>Deletion:</strong> Request deletion of your account or user-submitted content (we will remove content from our systems and any public listings; please note copies already downloaded by other users cannot be recovered from their devices).</li>
        <li><strong>Restriction / objection:</strong> Object to certain processing or request restriction where applicable.</li>
        <li><strong>Portability:</strong> Request an export of your personal data in a commonly used format.</li>
        <li><strong>CCPA-only:</strong> California residents can request disclosure of categories of personal data collected and opt-out of the sale of personal data (we do not sell personal data).</li>
      </ul>

      <h3 className="text-md font-semibold mt-4 mb-2">How to make a rights request</h3>
      <p className="mb-4 text-sm text-gray-700">Email <a href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a> with the subject line "Privacy Request" and include your account email and a short description of the request. We will verify your identity where necessary and respond within 30 days. For deletion requests we will remove your account and user-submitted content from our active systems and notify third-party processors where possible; complete removal from third-party backups may take longer.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Data minimization & retention</h3>
      <p className="mb-4 text-sm text-gray-700">We retain only the data necessary to provide the service and for legal/operational purposes. User-submitted content (stories used to create roasts) is retained for {`90 days`} by default to support delivery and troubleshooting, and may be deleted earlier on request. Transaction metadata is retained as long as necessary for accounting and refunds (typically up to 7 years depending on local law). We anonymize or remove identifiers where feasible.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Moderation, safety & content policy</h3>
      <p className="mb-4 text-sm text-gray-700">Content generated by ExRoast.buzz is intended for entertainment. Users are responsible for any personal information they include in submissions. We prohibit content that encourages violence, hate, or unlawful activity. We may remove content or suspend accounts that violate our Terms of Service. Moderation is a combination of automated safeguards and manual review where necessary to enforce policies.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Data sharing & third-party processors</h3>
      <p className="mb-4 text-sm text-gray-700">We use third-party providers to deliver the service (examples: Paddle for payments, Supabase for data, and AI/audio providers for generation). These providers receive only the data necessary to perform their functions (for example, Paddle receives payment/billing info). We require processors to follow appropriate security and confidentiality obligations.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Security measures</h3>
      <p className="mb-4 text-sm text-gray-700">We implement industry-standard security practices including encryption in transit (HTTPS), access controls, and regular audits. While we strive to protect your data, no system is 100% secure; report suspected breaches to <a href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a>.</p>

      <h3 className="text-md font-semibold mt-4 mb-2">Data controller & contact details</h3>
      <p className="mb-4 text-sm text-gray-700">Data controller: <strong>Opencipher Tech</strong> (trading as ExRoast.buzz). Registered address: NO. 4 Mc Dermott Road, Warri, Delta State, Nigeria. For data, privacy, or legal inquiries contact <a href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a>.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Cookies and Tracking</h2>
      <p className="mb-4 text-sm text-gray-700">We use cookies and similar technologies for analytics and to
        enhance the user experience. You can opt out of non-essential cookies by adjusting your browser
        settings. We use third-party analytics providers; consult those providers' privacy policies for details.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Third-Party Processors</h2>
      <p className="mb-4 text-sm text-gray-700">We use third-party processors for payments and hosting. Key
        examples: Paddle (payments), Supabase (data hosting), and any AI providers used to generate content.
        These providers receive only the data necessary to perform their services. We recommend listing the
        specific providers you rely on in production and linking to their privacy policies.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Delivery of Digital Goods</h2>
      <p className="mb-4 text-sm text-gray-700">Digital goods are delivered immediately after successful
        payment: a download link will appear on the purchase confirmation page and an email with the link will
        be sent to the address you provided. If delivery fails, contact support at <a
          href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a>.</p>

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
          href="mailto:contact@exroast.buzz" className="text-blue-600 underline">contact@exroast.buzz</a>.</p>
    </div>
  );
}
