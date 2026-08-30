export function PrivacyPolicyContent() {
  return (
    <div className="prose prose-sm max-w-none text-foreground/80 space-y-6 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:leading-relaxed [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
      <p>
        OneLGU is the official digital services portal of the Municipality of Dingras, Ilocos Norte. This policy explains what
        personal data we collect when you use it, why we collect it, and the rights you have over it under the Data Privacy Act
        of 2012 (Republic Act No. 10173).
      </p>

      <h2>1. What We Collect</h2>
      <p>When you register and use OneLGU, we collect:</p>
      <ul>
        <li><strong>Account information:</strong> full name, email address, phone number, home address, and assigned barangay.</li>
        <li><strong>Service requests:</strong> the details, attachments, and photos you submit when requesting a certification, filing a complaint, or (for barangay staff) submitting a report.</li>
        <li><strong>Technical data:</strong> IP address, browser/device information, and timestamps, recorded in an audit trail for every action taken on your account.</li>
        <li><strong>Authentication data:</strong> your password (stored hashed, never in plain text) and, if you enable it, a two-factor authentication (2FA) enrollment record.</li>
      </ul>

      <h2>2. Why We Collect It</h2>
      <ul>
        <li>To process certification requests, complaints, and reports you submit to your barangay or the municipal government.</li>
        <li>To verify your identity and prevent fraudulent use of government services.</li>
        <li>To notify you of updates to your requests.</li>
        <li>To maintain an audit trail of account activity, as required for government records accountability.</li>
        <li>To comply with municipal and national records-retention requirements for administrative and legal documents.</li>
      </ul>

      <h2>3. Who Can See Your Data</h2>
      <p>
        Your data is only visible to: barangay officials and municipal (LGU) staff processing your specific request, within
        their assigned barangay; and municipal system administrators, for account and system administration. We do not sell,
        rent, or share your personal data with third parties for marketing purposes.
      </p>

      <h2>4. How We Protect It</h2>
      <ul>
        <li>All data is encrypted in transit (HTTPS) and at rest.</li>
        <li>Access to resident, complaint, and certification data is restricted by role — barangay staff can only see records for their own barangay.</li>
        <li>Every access-sensitive action is logged with the actor, timestamp, and IP address.</li>
        <li>Optional two-factor authentication (2FA) is available for all accounts, and required for privileged staff accounts.</li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>Under RA 10173, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal data we hold about you.</li>
        <li><strong>Correct</strong> inaccurate data — update your profile anytime from your account settings.</li>
        <li><strong>Export</strong> a copy of your data — available from your Profile page.</li>
        <li>
          <strong>Request deletion</strong> of your personal data — available from your Profile page. Because barangay and
          municipal records must be retained under government records-retention rules, deleting your account removes your
          personal information (name, contact details) from your submissions but keeps the underlying request/report/complaint
          record for legal and administrative purposes, no longer tied to your identity.
        </li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        Account data is retained for as long as your account is active. Certification requests, complaints, and reports are
        retained per the municipality&apos;s records-retention policy, consistent with local government administrative requirements,
        even after an account is deleted.
      </p>

      <h2>7. Contact</h2>
      <p>
        For questions about this policy or to exercise your data privacy rights, contact your Barangay Hall directly, or the
        Municipality of Dingras&apos; Data Protection Officer through the Municipal Hall.
      </p>
    </div>
  );
}
