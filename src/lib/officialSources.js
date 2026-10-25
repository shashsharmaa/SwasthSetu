export const officialSources = {
  'Star Health': 'https://www.starhealth.in/locate-us/network-hospitals',
  'HDFC ERGO': 'https://www.hdfcergo.com/health-insurance/hospital-network',
  'TATA AIG': 'https://www.tataaig.com/health-insurance/network-hospitals',
  PMJAY: 'https://pmjay.gov.in/',
};

export function getSafeUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return officialSources.PMJAY;
  const trimmedUrl = url.trim();
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}

export function getOfficialSource(hospital, contextValue, resultType) {
  return hospital?.source_url
    || (resultType === 'scheme' ? officialSources.PMJAY : officialSources[contextValue] || officialSources['Star Health']);
}

export function getLastVerified(hospital) {
  return hospital?.last_verified || hospital?.lastVerified || null;
}

export function formatVerifiedDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}
