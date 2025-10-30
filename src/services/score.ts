// Lead scoring service with 0-100 scale scoring
// Based on: source, engagement, value, and email validation

export interface ScoringFactors {
  source?: string;
  estimated_value?: number;
  activities_last_30d?: number;
  last_activity?: string;
  email?: string;
  status?: string;
}

/**
 * Compute lead score (0-100) based on multiple factors
 * Formula: source_score + engagement_score + value_score + email_valid_score
 */
export function computeScore(lead: ScoringFactors): number {
  let score = 0;

  // Source scoring (0-20 points)
  const sourceScore = getSourceScore(lead.source);
  score += sourceScore;

  // Engagement scoring (0-25 points)
  const engagementScore = getEngagementScore(lead.activities_last_30d || 0);
  score += engagementScore;

  // Value scoring (0-25 points)
  const valueScore = getValueScore(lead.estimated_value || 0);
  score += valueScore;

  // Email validation scoring (0-10 points)
  const emailScore = getEmailScore(lead.email);
  score += emailScore;

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Source scoring: referral=20, web=10, ad=5, others=0
 */
function getSourceScore(source?: string): number {
  if (!source) return 0;
  
  switch (source.toLowerCase()) {
    case 'referral':
      return 20;
    case 'web':
      return 10;
    case 'ad':
    case 'advertisement':
      return 5;
    default:
      return 0;
  }
}

/**
 * Engagement scoring: min(#activities_last_30d * 5, 25)
 */
function getEngagementScore(activitiesLast30d: number): number {
  return Math.min(activitiesLast30d * 5, 25);
}

/**
 * Value scoring: normalize estimated_value to 0-25 (percentile-based)
 * For demo: simple scaling where 10000+ = 25, 5000 = 15, 1000 = 5, 0 = 0
 */
function getValueScore(estimatedValue: number): number {
  if (estimatedValue >= 10000) return 25;
  if (estimatedValue >= 5000) return 20;
  if (estimatedValue >= 2500) return 15;
  if (estimatedValue >= 1000) return 10;
  if (estimatedValue >= 500) return 5;
  return 0;
}

/**
 * Email validation scoring: 10 if valid email format, 0 otherwise
 */
function getEmailScore(email?: string): number {
  if (!email) return 0;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? 10 : 0;
}

/**
 * Helper to clamp number to range
 */
function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}