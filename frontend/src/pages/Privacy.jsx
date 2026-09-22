import React from 'react';

const Privacy = () => (
  <section className="bg-slate-50 py-16 dark:bg-slate-950">
    <div className="container-custom mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        MediCare respects your privacy and uses your information only to provide and improve clinic services.
      </p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Information we collect</h2>
          <p className="mt-2">We collect account, appointment, and contact information needed to coordinate your care.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">How we use information</h2>
          <p className="mt-2">Information is used for appointments, billing, support, security, and service improvement.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your choices</h2>
          <p className="mt-2">Contact our clinic team to request account assistance or ask questions about your information.</p>
        </section>
      </div>
    </div>
  </section>
);

export default Privacy;
