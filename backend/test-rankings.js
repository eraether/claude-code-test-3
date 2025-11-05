const analysisEngine = require('./analysis-engine');

async function test() {
  console.log('🏆 Testing Health Rankings with real CDC data...\n');

  try {
    console.log('Calculating health rankings for all states (2021)...');
    console.log('(This may take 30-60 seconds...)\n');

    const rankings = await analysisEngine.getHealthRankings(2021);

    console.log(`✅ Calculated rankings for ${rankings.length} states!\n`);

    if (rankings.length > 0) {
      console.log('Top 10 Healthiest States:\n');
      rankings.slice(0, 10).forEach((state, idx) => {
        console.log(`${idx + 1}. ${state.name} (${state.state})`);
        console.log(`   Score: ${state.score.toFixed(1)}/100`);
        console.log(`   Metrics analyzed: ${state.components}`);
        if (state.metrics.diabetes) console.log(`   - Diabetes: ${state.metrics.diabetes.toFixed(1)}%`);
        if (state.metrics.obesity) console.log(`   - Obesity: ${state.metrics.obesity.toFixed(1)}%`);
        console.log('');
      });

      console.log('\nBottom 5 States:\n');
      rankings.slice(-5).reverse().forEach((state, idx) => {
        console.log(`${rankings.length - idx}. ${state.name} (${state.state})`);
        console.log(`   Score: ${state.score.toFixed(1)}/100`);
        if (state.metrics.diabetes) console.log(`   - Diabetes: ${state.metrics.diabetes.toFixed(1)}%`);
        if (state.metrics.obesity) console.log(`   - Obesity: ${state.metrics.obesity.toFixed(1)}%`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
