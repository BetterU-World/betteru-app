/**
 * Revenue Split Helper
 * 
 * Centralizes the logic for splitting subscription revenue:
 * - 30% to affiliate (if referral exists)
 * - 10% to charity (always)
 * - Remainder to business
 */

export type RevenueSplit = {
  gross: number;
  affiliateAmount: number;
  charityAmount: number;
  businessNet: number;
};

/**
 * Calculate revenue split from gross subscription amount
 * @param gross - Gross amount in dollars (already converted from cents)
 * @param hasAffiliate - Whether this subscription has a referring affiliate
 * @returns Split breakdown of the revenue
 */
export function calculateRevenueSplit(
  gross: number,
  hasAffiliate: boolean
): RevenueSplit {
  const affiliateAmount = hasAffiliate ? gross * 0.30 : 0;
  const charityAmount = gross * 0.10;
  const businessNet = gross - affiliateAmount - charityAmount;

  return {
    gross,
    affiliateAmount,
    charityAmount,
    businessNet,
  };
}
