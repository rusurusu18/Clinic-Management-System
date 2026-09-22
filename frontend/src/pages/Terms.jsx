import React from 'react';

const Terms = () => (
  <section className="bg-slate-50 py-16 dark:bg-slate-950">
    <div className="container-custom mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        By using MediCare, you agree to use the clinic platform responsibly and provide accurate information.
      </p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Using the service</h2>
          <p className="mt-2">Use your account only for its intended purpose and keep your login details secure.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appointments and payments</h2>
          <p className="mt-2">Appointment availability, cancellation rules, and payment terms are shown during booking and checkout.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact</h2>
          <p className="mt-2">For questions about these terms, contact the MediCare clinic team through the Contact page.</p>
        </section>
      </div>
    </div>
  </section>
);

export default Terms;
