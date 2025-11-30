export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {new Date().toISOString().split('T')[0]}</p>

      <p className="mb-4">
        These Terms govern your use of the service. By using the service you agree to comply with applicable laws and
        these Terms.
      </p>

      <p className="mb-4">
        <strong>Content is user-generated humor; we don't endorse negativity.</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Acceptable Use</h2>
      <p className="text-sm text-gray-600">Do not use this service to harass, defame, or threaten others.</p>
    </div>
  );
}
