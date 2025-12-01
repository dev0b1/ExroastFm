import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Contact & Support</h1>

      <p className="mb-4 text-sm text-gray-700">We're here to help — whether it's a billing question, technical issue, or general feedback.</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Email</h2>
        <p className="text-sm text-gray-700">For support and billing, email <a href="mailto:support@exroast.buzz" className="text-blue-600 underline">support@exroast.buzz</a> and we'll reply within 1 business day.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Business / Legal</h2>
        <p className="text-sm text-gray-700">For legal and billing matters contact <a href="mailto:legal@exroast.buzz" className="text-blue-600 underline">legal@exroast.buzz</a>.</p>
        <p className="text-sm text-gray-700 mt-2">Registered address: <strong>NO. 4 Mc Dermott Road, Warri, Delta State, Nigeria</strong>.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Hours</h2>
        <p className="text-sm text-gray-700">Support hours: Mon–Fri, 09:00–17:00 WAT. We respond to urgent issues as quickly as possible.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          <li><Link href="/pricing" className="text-blue-600 underline">Pricing & Plans</Link></li>
          <li><Link href="/refund-policy" className="text-blue-600 underline">Refund Policy</Link></li>
          <li><Link href="/terms" className="text-blue-600 underline">Terms of Service</Link></li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Need faster help?</h2>
        <p className="text-sm text-gray-700">If this is a purchase or delivery problem, please include your order ID or the email you used for checkout to speed things up.</p>
      </section>
    </main>
  );
}
