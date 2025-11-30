export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">Last updated: {new Date().toISOString().split('T')[0]}</p>

      <p className="mb-4">
        We respect your privacy. This site collects minimal data required to process orders and improve
        the experience. We do not sell personal information.
      </p>

      <p className="mb-4">
        <strong>Content is user-generated humor; we don't endorse negativity.</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-sm text-gray-600">If you have questions about this policy, contact hello@example.com.</p>
    </div>
  );
}
