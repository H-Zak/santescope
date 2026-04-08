#!/usr/bin/env node
// Smoke test: validates 5 demo communes and index.json via HTTP fetch
// Usage: BASE_URL=https://your-deploy.vercel.app node scripts/smoke-test.js
// Requires Node 18+ (native fetch)

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const COMMUNES = [
  { code: '75056', name: 'Paris', expectNullScore: true },
  { code: '02691', name: 'Saint-Quentin', expectNullScore: false },
  { code: '59392', name: 'Maubeuge', expectNullScore: false },
  { code: '08409', name: 'Sedan', expectNullScore: false },
  { code: '52123', name: 'Chevillon', expectNullScore: false },
];

const REQUIRED_FIELDS = ['code', 'nom', 'dept', 'data_quality', 'score_detail', 'coords', 'jumelles'];

let passed = 0;
let failed = 0;

function fail(msg) {
  console.error(`  FAIL: ${msg}`);
  failed++;
}

function pass(msg) {
  console.log(`  PASS: ${msg}`);
  passed++;
}

async function testCommune(commune) {
  const url = `${BASE}/data/communes/${commune.code}.json`;
  console.log(`\nTesting ${commune.name} (${commune.code})...`);

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    fail(`Fetch failed: ${err.message}`);
    return;
  }

  if (res.status !== 200) {
    fail(`HTTP ${res.status} for ${url}`);
    return;
  }
  pass(`HTTP 200`);

  let data;
  try {
    data = await res.json();
  } catch (err) {
    fail(`Invalid JSON: ${err.message}`);
    return;
  }
  pass(`Valid JSON`);

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) {
      fail(`Missing field: ${field}`);
    } else {
      pass(`Field present: ${field}`);
    }
  }

  // Check jumelles is array
  if (!Array.isArray(data.jumelles)) {
    fail(`jumelles is not an array`);
  } else {
    pass(`jumelles is array (${data.jumelles.length} entries)`);
  }

  // Score checks
  if (commune.expectNullScore) {
    if (data.score !== null) {
      fail(`Expected score=null for ${commune.name}, got ${data.score}`);
    } else {
      pass(`score is null (expected for ${commune.name})`);
    }
    if (data.score_detail && data.score_detail.apl !== null) {
      fail(`Expected score_detail.apl=null for ${commune.name}, got ${data.score_detail.apl}`);
    } else {
      pass(`score_detail.apl is null (expected for ${commune.name})`);
    }
    if (data.score_detail && data.score_detail.temps_urgences_min !== null) {
      fail(`Expected score_detail.temps_urgences_min=null for ${commune.name}, got ${data.score_detail.temps_urgences_min}`);
    } else {
      pass(`score_detail.temps_urgences_min is null (expected for ${commune.name})`);
    }
  } else {
    if (typeof data.score !== 'number') {
      fail(`Expected numeric score for ${commune.name}, got ${data.score}`);
    } else {
      pass(`score is numeric: ${data.score}`);
    }
    if (!['A', 'B', 'C', 'D', 'E'].includes(data.classe)) {
      fail(`Expected classe A-E for ${commune.name}, got ${data.classe}`);
    } else {
      pass(`classe is valid: ${data.classe}`);
    }
  }
}

async function testIndex() {
  const url = `${BASE}/data/index.json`;
  console.log(`\nTesting index.json...`);

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    fail(`Fetch failed: ${err.message}`);
    return;
  }

  if (res.status !== 200) {
    fail(`HTTP ${res.status} for ${url}`);
    return;
  }
  pass(`HTTP 200`);

  let data;
  try {
    data = await res.json();
  } catch (err) {
    fail(`Invalid JSON: ${err.message}`);
    return;
  }
  pass(`Valid JSON`);

  if (!Array.isArray(data)) {
    fail(`index.json should be an array`);
  } else if (data.length < 30000) {
    fail(`index.json has only ${data.length} entries (expected > 30000)`);
  } else {
    pass(`index.json has ${data.length} entries (> 30000)`);
  }
}

async function main() {
  console.log(`SanteScope smoke test`);
  console.log(`Base URL: ${BASE}`);
  console.log('='.repeat(50));

  for (const commune of COMMUNES) {
    await testCommune(commune);
  }

  await testIndex();

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error(`\nSMOKE TEST FAILED`);
    process.exit(1);
  } else {
    console.log(`\nSMOKE TEST PASSED`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
