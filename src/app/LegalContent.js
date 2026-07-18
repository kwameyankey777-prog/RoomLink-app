"use client";

import { useState } from "react";

export default function LegalContent() {
  const [tab, setTab] = useState("privacy");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 bg-gray-100 rounded-full p-1 w-fit">
        <button
          onClick={() => setTab("privacy")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            tab === "privacy" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setTab("terms")}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            tab === "terms" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Terms of Service
        </button>
      </div>

      {tab === "privacy" ? (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-5">
          <p className="text-xs text-gray-400">Last updated: July 19, 2026</p>

          <p>
            HnAlink ("HnAlink," "we," "us," or "our") provides a platform connecting
            students and other occupants ("Occupants") with hostel and apartment owners
            ("Hosts") in Ghana. This Privacy Policy explains how we collect, use, store,
            and share information when you use our website and mobile application
            (together, the "Platform").
          </p>
          <p>
            This Policy is intended to comply with Ghana's Data Protection Act, 2012
            (Act 843), and reflects our current practices as an early-stage service.
            HnAlink, a business currently operating from Agona Nkwanta, Ghana,
            is the data controller responsible for your information.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">1. Information We Collect</h3>
          <p><strong>Account information:</strong> full name, email address, phone number,
            password (stored securely, hashed), and account role (Occupant or Host).</p>
          <p><strong>Listing information:</strong> for Hosts, property name, address, town,
            price, capacity, description, photographs, and geographic coordinates you choose
            to provide.</p>
          <p><strong>Booking and review information:</strong> booking requests, messages
            accompanying a booking, reviews, ratings, and any replies to reviews.</p>
          <p><strong>Messages:</strong> content of messages sent between Occupants and Hosts
            through our in-app messaging feature.</p>
          <p><strong>Profile photo:</strong> if you choose to upload one.</p>
          <p><strong>Location data:</strong> if you grant permission, your device's
            approximate or precise location, used only to show your position on the map
            feature.</p>
          <p><strong>Usage data:</strong> pages viewed, listings recently viewed (stored on
            your device only), and general technical information such as browser type and
            device information.</p>

          <h3 className="text-base font-bold text-gray-900 mt-6">2. How We Use Your Information</h3>
          <p>We use the information described above to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage your account and verify your identity;</li>
            <li>Enable Hosts to list properties and Occupants to search, book, and review them;</li>
            <li>Facilitate communication between Occupants and Hosts;</li>
            <li>Send transactional emails, such as booking confirmations and password resets;</li>
            <li>Display your approximate location on the map feature, where enabled;</li>
            <li>Maintain the security and integrity of the Platform;</li>
            <li>Improve and troubleshoot the Platform.</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h3 className="text-base font-bold text-gray-900 mt-6">3. Legal Basis for Processing</h3>
          <p>
            We process your information on the basis of your consent (for example, when you
            create an account or grant location permission), the necessity of processing to
            perform our agreement with you (for example, facilitating a booking), and our
            legitimate interest in operating and improving the Platform.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">4. Sharing of Information</h3>
          <p>We share information only as follows:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Between Occupants and Hosts</strong> as necessary to facilitate a
              booking or listing — for example, a Host's name and contact details are shown
              to an Occupant who wishes to book, and an Occupant's name is shown to the Host
              reviewing a request.
            </li>
            <li>
              <strong>Service providers</strong> who help us run the Platform, including
              Supabase (database, authentication, and file storage) and Google Translate
              (optional page translation, for users who choose a non-English display
              language).
            </li>
            <li>
              <strong>Legal obligations</strong> — we may disclose information if required by
              law or to protect the rights, safety, or property of HnAlink, our users, or
              others.
            </li>
          </ul>

          <h3 className="text-base font-bold text-gray-900 mt-6">5. Data Storage and Security</h3>
          <p>
            Your data is stored using Supabase's infrastructure, with access restricted
            through row-level security policies designed so that users can generally only
            view or modify their own data, except where sharing is required for the
            Platform's core functions (such as viewing listings or receiving booking
            requests). While we take reasonable steps to protect your information, no method
            of transmission or storage is completely secure, and we cannot guarantee absolute
            security.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">6. Your Rights</h3>
          <p>Under Ghana's Data Protection Act, 2012 (Act 843), you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you;</li>
            <li>Request correction of inaccurate or incomplete data;</li>
            <li>Request deletion of your account and associated personal data;</li>
            <li>Object to or restrict certain processing of your data;</li>
            <li>Withdraw consent at any time, where processing is based on consent.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:HnAlink20@gmail.com" className="text-[#1E88E5]">HnAlink20@gmail.com</a>.
            You may also lodge a complaint with Ghana's Data Protection Commission.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">7. Data Retention</h3>
          <p>
            We retain your information for as long as your account is active or as needed to
            provide the Platform's services. If you delete your account, we will delete or
            anonymize your personal data within a reasonable period, except where retention
            is required to comply with legal obligations or resolve disputes.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">8. Children's Privacy</h3>
          <p>
            The Platform is intended for users who are at least 18 years old, or the age of
            majority in their jurisdiction. We do not knowingly collect personal information
            from children.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">9. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be
            reflected by updating the "Last updated" date above.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">10. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:HnAlink20@gmail.com" className="text-[#1E88E5]">HnAlink20@gmail.com</a>.
          </p>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-5">
          <p className="text-xs text-gray-400">Last updated: July 19, 2026</p>

          <p>
            These Terms of Service ("Terms") govern your access to and use of HnAlink (the
            "Platform"), operated by HnAlink ("HnAlink," "we," "us," or "our"). By
            creating an account or using the Platform, you agree to these Terms. If you do
            not agree, please do not use the Platform.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">1. Eligibility</h3>
          <p>
            You must be at least 18 years old to create an account and use the Platform.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">2. Nature of the Platform</h3>
          <p>
            HnAlink is a listing and communication platform that connects Occupants seeking
            accommodation with Hosts offering hostel rooms or apartments. HnAlink is not a
            party to any rental agreement, lease, or booking arrangement made between an
            Occupant and a Host. We do not own, manage, or inspect any listed property, and
            we do not guarantee the accuracy of any listing, the conduct of any user, or the
            outcome of any booking.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">3. Accounts and Roles</h3>
          <p>
            Users register as either an Occupant or a Host. You are responsible for
            maintaining the confidentiality of your account credentials and for all activity
            under your account. You agree to provide accurate and current information.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">4. Listings (Hosts)</h3>
          <p>
            Hosts are solely responsible for the accuracy of their listings, including price,
            description, photographs, capacity, and location. Listings are subject to review
            and approval before appearing publicly, and HnAlink reserves the right to
            reject, suspend, or remove any listing at its discretion, including for
            suspected inaccuracy, policy violations, or inappropriate content.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">5. Bookings (Occupants)</h3>
          <p>
            A booking request submitted through the Platform is a request only. HnAlink does
            not guarantee that any booking request will be accepted, and does not process
            payments on behalf of Hosts or Occupants at this time. Any payment, deposit, or
            financial arrangement is made directly between the Occupant and Host, outside of
            the Platform, and at their own risk. HnAlink is not responsible for any
            financial loss, fraud, or dispute arising from arrangements made off-platform.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">6. Reviews</h3>
          <p>
            Occupants who have used the messaging or booking features may leave reviews.
            Reviews must be honest, based on genuine experience, and must not contain
            defamatory, abusive, or unlawful content. HnAlink reserves the right to remove
            any review that violates these Terms.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">7. User Conduct</h3>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post false, misleading, or fraudulent listings or reviews;</li>
            <li>Harass, threaten, or abuse other users through the messaging feature;</li>
            <li>Use the Platform for any unlawful purpose;</li>
            <li>Attempt to circumvent, disable, or interfere with the security of the Platform.</li>
          </ul>

          <h3 className="text-base font-bold text-gray-900 mt-6">8. Disclaimer of Warranties</h3>
          <p>
            The Platform is provided "as is" and "as available," without warranties of any
            kind, whether express or implied. HnAlink does not warrant that listings are
            accurate, that Hosts or Occupants will act lawfully or in good faith, or that the
            Platform will be uninterrupted or error-free.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">9. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by the laws of Ghana, HnAlink shall not be
            liable for any indirect, incidental, special, or consequential damages, or for
            any loss of income, profit, or data, arising from your use of the Platform,
            any booking, any listing, or any interaction between users, whether such
            liability arises in contract, tort, or otherwise.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">10. Termination</h3>
          <p>
            We may suspend or terminate your account at any time, with or without notice, if
            we believe you have violated these Terms or engaged in conduct harmful to the
            Platform or its users.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">11. Governing Law</h3>
          <p>
            These Terms are governed by the laws of the Republic of Ghana. Any dispute
            arising from these Terms or your use of the Platform shall be subject to the
            exclusive jurisdiction of the courts of Ghana.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">12. Changes to These Terms</h3>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after
            changes take effect constitutes acceptance of the revised Terms.
          </p>

          <h3 className="text-base font-bold text-gray-900 mt-6">13. Contact Us</h3>
          <p>
            Questions about these Terms can be directed to{" "}
            <a href="mailto:HnAlink20@gmail.com" className="text-[#1E88E5]">HnAlink20@gmail.com</a>.
          </p>
        </div>
      )}
      <div className="h-24" />
    </div>
  );
}