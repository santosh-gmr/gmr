async function logConsentToBackend(status) {
  // YOUR LIVE URL
  const API_URL = 'https://3842504-gmr-stage.adobeioruntime.net/api/v1/web/GMR-0.0.1/generic';

  const userData = {
    userIp: 'anonymous',
    location: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    consentType: status
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Consent Logged.');
      // CRITICAL: Save the ID returned by backend so we can delete it later
      if (result.id) {
        localStorage.setItem('gmr-privacy-id', result.id);
        console.log('💾 Privacy ID auto-saved.');
      }
    }
  } catch (error) {
    console.error('❌ Log failed', error);
  }
}

export default function decorate(block) {
  // 1. CHECK PREVIOUS CHOICE
  if (localStorage.getItem('gmr-cookie-consent')) {
    const wrapper = block.closest('.cookie-consent-wrapper');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }

  // 2. READ CONFIG
  const conf = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim();
    if (key === 'message') conf[key] = row.children[1]?.innerHTML;
    else conf[key] = row.children[1]?.textContent?.trim();
  });

  // 3. BUILD UI
  block.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'cookie-consent';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'cookie-message';
  msgDiv.innerHTML = conf.message || 'We use cookies.';

  const btnDiv = document.createElement('div');
  btnDiv.className = 'cookie-buttons';

  if (conf.policyLink) {
    const policy = document.createElement('a');
    policy.href = conf.policyLink;
    policy.textContent = conf.policyLabel || 'Privacy Policy';
    policy.className = 'cookie-policy-link';
    btnDiv.append(policy);
  }

  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'cookie-btn primary';
  acceptBtn.textContent = conf.acceptLabel || 'Allow All';
  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('gmr-cookie-consent', 'accepted');
    if(block.closest('.cookie-consent-wrapper')) block.closest('.cookie-consent-wrapper').style.display = 'none';
    logConsentToBackend('accepted');
  });

  const declineBtn = document.createElement('button');
  declineBtn.className = 'cookie-btn secondary';
  declineBtn.textContent = conf.declineLabel || 'Decline';
  declineBtn.addEventListener('click', () => {
    localStorage.setItem('gmr-cookie-consent', 'declined');
    if(block.closest('.cookie-consent-wrapper')) block.closest('.cookie-consent-wrapper').style.display = 'none';
  });

  btnDiv.append(declineBtn);
  btnDiv.append(acceptBtn);
  container.append(msgDiv);
  container.append(btnDiv);
  block.append(container);

  if(block.closest('.cookie-consent-wrapper')) block.closest('.cookie-consent-wrapper').style.display = 'block';
}