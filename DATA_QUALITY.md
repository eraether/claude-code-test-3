# Data Quality Assessment & Limitations

## ⚠️ Critical: Self-Reported Data

**All health behavior and obesity data in this platform comes from the CDC's BRFSS (Behavioral Risk Factor Surveillance System).**

### What is BRFSS?
- **Random-digit-dial telephone surveys** of U.S. adults (18+)
- Respondents **self-report** height, weight, and health behaviors
- **NOT measured** or clinically verified data

### Known Biases & Limitations

#### 1. **Underestimation of Obesity (5-10%)**
Self-reported obesity rates are consistently **5-10 percentage points lower** than measured rates.

**Example:**
- BRFSS (self-reported): Hawaii 25.9% obesity
- NHANES (measured): National average ~42% obesity (2017-2020)
- **Reality: Actual rates are likely higher than shown**

#### 2. **Social Desirability Bias**
- People underreport weight
- People overreport height
- People overreport exercise
- People underreport smoking

#### 3. **Sampling Bias**
Phone surveys may **undersample**:
- Young adults (mobile-only, screening calls)
- Non-English speakers
- Low-income households (no landline)
- Racial/ethnic minorities in some regions
- Rural/remote populations

#### 4. **Aggregation Hides Disparities**

The "Overall" category **masks enormous differences** between demographic groups.

**Hawaii Example:**
| Group | Obesity Rate |
|-------|--------------|
| **Overall (BRFSS)** | 25.9% |
| Native Hawaiian/Pacific Islander | ~45-50% |
| Asian | ~15-20% |
| White | ~25-30% |

The state average of 25.9% **doesn't represent any actual community** - it's a statistical artifact.

#### 5. **Methodology Changes**
Year-to-year variations may reflect:
- Survey design changes
- Weighting methodology updates
- Cell phone vs landline sampling shifts
- **NOT actual health trend changes**

## Data Quality Issues by State

### States with Known Data Quality Concerns

#### **Hawaii**
- **Issue**: Aggregate obesity (25.9%) masks 45-50% rate in Native Hawaiian/Pacific Islander community
- **Why**: Large Asian population (~38%) has lower rates, pulling average down
- **Reality**: State has both some of the healthiest AND unhealthiest populations
- **Recommendation**: ALWAYS view demographic breakdowns for Hawaii

#### **California**
- **Issue**: Extreme ethnic diversity makes "Overall" meaningless
- **Why**: Hispanic, Asian, Black, and White populations have vastly different health profiles
- **Reality**: A single state-level number obscures more than it reveals
- **Recommendation**: View by county or demographic group

#### **Alaska**
- **Issue**: Alaska Native communities have different health patterns than state average
- **Why**: Remote Alaska Native villages are likely undersampled in phone surveys
- **Reality**: Urban Anchorage data may dominate state average
- **Recommendation**: Separate Alaska Native vs non-Native data

#### **New Mexico, Arizona**
- **Issue**: Large Native American populations may be undersampled
- **Why**: Tribal lands, language barriers, phone access issues
- **Recommendation**: Consult tribal health data directly

#### **Puerto Rico, U.S. Territories**
- **Issue**: Different survey methodology, potential language/cultural factors
- **Note**: Shows anomaly - high diabetes (14.5%) for obesity level (36%)
- **Possible factors**: Genetic predisposition in Caribbean populations

## What The Data IS Good For

✅ **State-level comparisons** - Rankings are more reliable than absolute values
✅ **Regional patterns** - Geographic trends are generally valid
✅ **Time trends** - Changes over time (if methodology stays constant)
✅ **Correlation analysis** - Relationships between variables
✅ **Policy planning** - Directional guidance (not precise targeting)

## What The Data IS NOT Good For

❌ **Absolute prevalence estimates** - Likely 5-10% too low
❌ **Small demographic groups** - Sample sizes too small
❌ **Precise community-level targeting** - Use local measured data
❌ **Year-to-year fluctuations** - May be noise, not signal
❌ **Diverse populations** - "Overall" hides critical disparities

## Recommendations for Users

### For Researchers
1. **Treat obesity rates as MINIMUM estimates**
2. **Always request demographic breakdowns** instead of "Overall"
3. **Cross-validate with measured data** (NHANES, local health systems)
4. **Use confidence intervals** - reported in data but often ignored
5. **Consult methodology notes** for survey year changes

### For Policymakers
1. **Focus on rankings/trends**, not absolute numbers
2. **Don't rely on single data source** - triangulate with:
   - Hospital/clinic data
   - School health screenings
   - Insurance claims data
3. **Investigate anomalies** - If Hawaii shows 26% obesity, dig deeper
4. **Fund local measured surveys** for high-stakes decisions

### For General Public
1. **Add 5-10% to obesity rates** for realistic estimates
2. **Your group may differ** - "Overall" averages hide your community
3. **Trends matter more** - Is it getting better or worse?
4. **Be skeptical of rankings** - Small differences may not be real

## Data Sources Used in This Platform

| Metric | Source | Collection Method | Frequency |
|--------|--------|-------------------|-----------|
| Obesity | BRFSS | Self-reported phone survey | Annual |
| Diabetes | BRFSS | Self-reported phone survey | Annual |
| Smoking | BRFSS | Self-reported phone survey | Annual |
| Physical Activity | BRFSS | Self-reported phone survey | Annual |
| Cancer Mortality | NVSS (National Vital Statistics) | Death certificates | Annual |
| CVD Mortality | NVSS | Death certificates | Annual |

**Note:** Mortality data (cancer, CVD) is **measured** and more reliable than behavioral data.

## Alternative Data Sources

For more accurate estimates:

1. **NHANES (National Health and Nutrition Examination Survey)**
   - Measured height/weight by trained professionals
   - National estimates only (not state-level)
   - Considered "gold standard"

2. **State-specific measured surveys**
   - Some states conduct their own measured surveys
   - Check state health department

3. **Electronic Health Records**
   - Some health systems share anonymized data
   - More accurate but coverage varies

4. **Demographic-specific studies**
   - Many ethnic groups have dedicated health research
   - Better for understanding specific communities

## Bottom Line

**This platform correctly processes and analyzes the CDC data.**

**BUT** the CDC data itself has significant limitations.

**Real obesity and health problems are worse than the numbers suggest.**

Use this platform for:
- Identifying patterns
- Comparing states
- Exploring correlations
- Understanding trends

Do NOT use for:
- Precise prevalence estimates
- Representing diverse communities
- Life-or-death policy decisions without validation

---

*Always remember: The map is not the territory. The data is not the reality.*

*Last Updated: November 2025*
