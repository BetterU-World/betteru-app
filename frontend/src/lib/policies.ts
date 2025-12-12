export const TERMS_VERSION = "2025-12-12";
export const PRIVACY_VERSION = "2025-12-12";

export type LegalStatus = {
  isAdultConfirmed: boolean;
  adultConfirmedAt?: string | Date | null;
  acceptedTermsVersion?: string | null;
  acceptedTermsAt?: string | Date | null;
  acceptedPrivacyVersion?: string | null;
  acceptedPrivacyAt?: string | Date | null;
};

export function needsPolicyAcceptance(user: LegalStatus | null | undefined): boolean {
  if (!user) return true;
  const adultOk = !!user.isAdultConfirmed && !!user.adultConfirmedAt;
  const termsOk = user.acceptedTermsVersion === TERMS_VERSION && !!user.acceptedTermsAt;
  const privacyOk = user.acceptedPrivacyVersion === PRIVACY_VERSION && !!user.acceptedPrivacyAt;
  return !(adultOk && termsOk && privacyOk);
}

export function getPolicyStatus(user: LegalStatus | null | undefined) {
  const isAdultConfirmed = !!(user && user.isAdultConfirmed && user.adultConfirmedAt);
  const termsOk = !!(user && user.acceptedTermsVersion === TERMS_VERSION && user.acceptedTermsAt);
  const privacyOk = !!(user && user.acceptedPrivacyVersion === PRIVACY_VERSION && user.acceptedPrivacyAt);
  return {
    isAdultConfirmed,
    termsOk,
    privacyOk,
    needsOnboarding: !(isAdultConfirmed && termsOk && privacyOk),
  };
}
