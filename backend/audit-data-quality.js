const { execSync } = require('child_process');

function curlGet(url) {
  try {
    const result = execSync(`curl -s '${url}'`, {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024
    });
    return JSON.parse(result);
  } catch (error) {
    console.error('Curl failed:', error.message);
    return [];
  }
}

async function auditDataQuality() {
  console.log('🔍 DATA QUALITY AUDIT - 2021 CDC Health Data\n');
  console.log('=' .repeat(70));

  // Check obesity data for all states
  console.log('\n📊 OBESITY DATA AUDIT (Adult Populations)\n');

  const obesityUrl = 'https://data.cdc.gov/resource/hksd-2xuw.json?yearstart=2021&topic=Nutrition%2C%20Physical%20Activity%2C%20and%20Weight%20Status&stratification1=Overall&$limit=1000';
  const obesityData = curlGet(obesityUrl);

  const adultObesity = obesityData
    .filter(r => r.question.includes('Obesity among adults') && r.datavalue)
    .map(r => ({
      state: r.locationabbr,
      name: r.locationdesc,
      value: parseFloat(r.datavalue),
      type: r.datavaluetype,
      source: r.datasource
    }))
    .filter(r => r.state !== 'US' && r.state.length === 2)
    .sort((a, b) => a.value - b.value);

  console.log(`Total states with adult obesity data: ${adultObesity.length}\n`);

  console.log('LOWEST 10 (Potentially Suspect):');
  adultObesity.slice(0, 10).forEach((s, i) => {
    const flag = s.value < 23 ? '⚠️ ' : '';
    console.log(`${i+1}. ${flag}${s.name}: ${s.value}% (${s.type})`);
  });

  console.log('\nHIGHEST 10:');
  adultObesity.slice(-10).reverse().forEach((s, i) => {
    console.log(`${i+1}. ${s.name}: ${s.value}% (${s.type})`);
  });

  // National average
  const avgObesity = adultObesity.reduce((sum, s) => sum + s.value, 0) / adultObesity.length;
  console.log(`\nNational Average (from state data): ${avgObesity.toFixed(1)}%`);

  // Check for known high-obesity states
  console.log('\n🎯 CHECKING KNOWN HIGH-OBESITY STATES:\n');
  const knownHighObesity = ['WV', 'MS', 'AL', 'LA', 'AR', 'KY', 'TN', 'OK'];
  knownHighObesity.forEach(abbr => {
    const state = adultObesity.find(s => s.state === abbr);
    if (state) {
      const expectedHigh = state.value >= 35;
      const flag = expectedHigh ? '✓' : '⚠️ LOWER THAN EXPECTED';
      console.log(`${abbr} (${state.name}): ${state.value}% ${flag}`);
    } else {
      console.log(`${abbr}: NO DATA FOUND ❌`);
    }
  });

  // Check diabetes data
  console.log('\n' + '='.repeat(70));
  console.log('\n💉 DIABETES DATA AUDIT\n');

  const diabetesUrl = 'https://data.cdc.gov/resource/hksd-2xuw.json?yearstart=2021&topic=Diabetes&stratification1=Overall&$limit=1000';
  const diabetesData = curlGet(diabetesUrl);

  const adultDiabetes = diabetesData
    .filter(r => r.question.includes('Diabetes among adults') && r.datavalue)
    .map(r => ({
      state: r.locationabbr,
      name: r.locationdesc,
      value: parseFloat(r.datavalue),
      type: r.datavaluetype
    }))
    .filter(r => r.state !== 'US' && r.state.length === 2)
    .sort((a, b) => a.value - b.value);

  console.log(`Total states with adult diabetes data: ${adultDiabetes.length}\n`);

  console.log('LOWEST 10:');
  adultDiabetes.slice(0, 10).forEach((s, i) => {
    console.log(`${i+1}. ${s.name}: ${s.value}% (${s.type})`);
  });

  console.log('\nHIGHEST 10:');
  adultDiabetes.slice(-10).reverse().forEach((s, i) => {
    console.log(`${i+1}. ${s.name}: ${s.value}% (${s.type})`);
  });

  // Check correlation between obesity and diabetes
  console.log('\n' + '='.repeat(70));
  console.log('\n🔗 OBESITY-DIABETES CORRELATION CHECK\n');

  const statesWithBoth = adultObesity
    .map(o => {
      const d = adultDiabetes.find(di => di.state === o.state);
      return d ? {
        state: o.state,
        name: o.name,
        obesity: o.value,
        diabetes: d.value,
        ratio: (d.value / o.value).toFixed(2)
      } : null;
    })
    .filter(Boolean);

  console.log(`States with both metrics: ${statesWithBoth.length}\n`);

  // Find anomalies (high obesity but low diabetes, or vice versa)
  console.log('ANOMALIES (Unusual obesity-to-diabetes ratios):\n');

  const avgRatio = statesWithBoth.reduce((sum, s) => sum + parseFloat(s.ratio), 0) / statesWithBoth.length;
  const anomalies = statesWithBoth
    .filter(s => Math.abs(parseFloat(s.ratio) - avgRatio) > avgRatio * 0.3)
    .sort((a, b) => Math.abs(parseFloat(b.ratio) - avgRatio) - Math.abs(parseFloat(a.ratio) - avgRatio));

  anomalies.slice(0, 10).forEach(s => {
    const direction = parseFloat(s.ratio) > avgRatio ? 'HIGH diabetes for obesity level' : 'LOW diabetes for obesity level';
    console.log(`${s.name}: Obesity ${s.obesity}%, Diabetes ${s.diabetes}% (ratio: ${s.ratio}, ${direction})`);
  });

  console.log(`\nAverage diabetes-to-obesity ratio: ${avgRatio.toFixed(2)}`);

  // Check data sources
  console.log('\n' + '='.repeat(70));
  console.log('\n📋 DATA SOURCE ANALYSIS\n');

  const sources = {};
  obesityData.forEach(r => {
    if (!sources[r.datasource]) sources[r.datasource] = 0;
    sources[r.datasource]++;
  });

  console.log('Data sources for obesity metrics:');
  Object.entries(sources).forEach(([source, count]) => {
    console.log(`  ${source}: ${count} records`);
  });

  // Check for self-reported vs measured
  console.log('\nData collection method:');
  const brfss = obesityData.filter(r => r.datasource === 'BRFSS');
  if (brfss.length > 0) {
    console.log('  ⚠️  BRFSS = Behavioral Risk Factor Surveillance System');
    console.log('  ⚠️  This is SELF-REPORTED data from phone surveys');
    console.log('  ⚠️  Known to underestimate obesity by 5-10 percentage points');
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📝 DATA QUALITY SUMMARY\n');

  console.log('ISSUES IDENTIFIED:');
  console.log('1. ⚠️  All obesity data is self-reported (BRFSS surveys)');
  console.log('2. ⚠️  Self-reported data typically underestimates obesity by 5-10%');
  console.log('3. ⚠️  Phone surveys may undersample certain demographics');
  console.log('4. ⚠️  "Overall" aggregation masks disparities between ethnic groups');

  const lowObesityStates = adultObesity.filter(s => s.value < 23);
  if (lowObesityStates.length > 0) {
    console.log(`5. ⚠️  ${lowObesityStates.length} states show unusually low obesity (<23%)`);
  }

  console.log('\nRECOMMENDATIONS:');
  console.log('• Add "Self-reported data" disclaimer to all results');
  console.log('• Note that actual obesity rates likely 5-10% higher');
  console.log('• Consider showing demographic breakdowns instead of "Overall"');
  console.log('• Cross-reference with measured data when available (NHANES)');
  console.log('• Flag results that seem inconsistent with known patterns');

  console.log('\n' + '='.repeat(70));
}

auditDataQuality();
