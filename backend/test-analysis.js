const analysisEngine = require('./analysis-engine');

async function test() {
  console.log('🧠 Testing AI Analysis Engine with real CDC data...\n');

  try {
    console.log('Generating insights...');
    const insights = await analysisEngine.generateInsights();

    console.log(`\n✅ Generated ${insights.length} insights!\n`);

    if (insights.length > 0) {
      console.log('Top 5 insights by significance:\n');
      insights.slice(0, 5).forEach((insight, idx) => {
        console.log(`${idx + 1}. [${insight.type.toUpperCase()}] ${insight.title}`);
        console.log(`   ${insight.description}`);
        console.log(`   Significance: ${insight.significance.toFixed(0)}%\n`);
      });
    } else {
      console.log('⚠️ No insights generated - may need more data or query adjustments');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
