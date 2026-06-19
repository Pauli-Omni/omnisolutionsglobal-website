'use strict';

function isPrivateIp(ip) {
  if (!ip) return true;
  const normalized = String(ip).replace(/^::ffff:/, '');
  if (normalized === '127.0.0.1' || normalized === '::1') return true;
  if (normalized.startsWith('10.') || normalized.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(normalized)) return true;
  return false;
}

async function lookupGeo(ip) {
  if (isPrivateIp(ip)) {
    return {
      city: 'local',
      region: 'development',
      country: 'DEV',
      label: 'Local / development network'
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, 3500);

  try {
    const url = 'http://ip-api.com/json/'
      + encodeURIComponent(ip)
      + '?fields=status,country,regionName,city';
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    if (data && data.status === 'success') {
      const parts = [data.city, data.regionName, data.country].filter(Boolean);
      return {
        city: data.city || '',
        region: data.regionName || '',
        country: data.country || '',
        label: parts.join(', ') || 'Unknown'
      };
    }
  } catch (_err) {
    /* fallback below */
  } finally {
    clearTimeout(timer);
  }

  return {
    city: '',
    region: '',
    country: '',
    label: 'Unavailable'
  };
}

module.exports = {
  lookupGeo,
  isPrivateIp
};
