import { SleepLog, HabitLog } from "@workspace/db";

interface DiseaseRisk {
  diseaseName: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
  riskScore: number;
  predictedTimeframe: string;
  contributingFactors: string[];
  recommendations: string[];
}

function getRiskLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "high";
  return "critical";
}

function getTimeframe(score: number): string {
  if (score < 25) return "10+ years";
  if (score < 40) return "7-10 years";
  if (score < 55) return "5-7 years";
  if (score < 70) return "3-5 years";
  if (score < 85) return "1-3 years";
  return "Within 1 year";
}

export function analyzePredictions(sleepLogs: SleepLog[], habitLogs: HabitLog[], profile: {
  age: number;
  gender: string;
  weight: number;
  height: number;
  existingConditions: string[];
  familyHistory: string[];
}): { overallHealthScore: number; diseases: DiseaseRisk[]; summary: string; dataInsufficient: boolean } {
  const dataInsufficient = sleepLogs.length < 3 && habitLogs.length < 3;

  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((s, l) => s + l.durationHours, 0) / sleepLogs.length
    : 7;

  const avgExercise = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.exerciseMinutes, 0) / habitLogs.length
    : 30;

  const avgStress = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.stressLevel, 0) / habitLogs.length
    : 5;

  const avgWater = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.waterGlasses, 0) / habitLogs.length
    : 6;

  const avgSmoking = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.smokingCigarettes, 0) / habitLogs.length
    : 0;

  const avgAlcohol = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.alcoholDrinks, 0) / habitLogs.length
    : 0;

  const avgScreenTime = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.screenTimeHours, 0) / habitLogs.length
    : 4;

  const avgMeditation = habitLogs.length > 0
    ? habitLogs.reduce((s, l) => s + l.meditationMinutes, 0) / habitLogs.length
    : 0;

  const poorSleepLogs = sleepLogs.filter(l => l.quality === "poor" || l.quality === "fair").length;
  const poorSleepRatio = sleepLogs.length > 0 ? poorSleepLogs / sleepLogs.length : 0;

  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const hasHypertensionHistory = profile.familyHistory.some(f => f.toLowerCase().includes("hypert") || f.toLowerCase().includes("blood pressure"));
  const hasDiabetesHistory = profile.familyHistory.some(f => f.toLowerCase().includes("diabet"));
  const hasHeartHistory = profile.familyHistory.some(f => f.toLowerCase().includes("heart") || f.toLowerCase().includes("cardiac"));
  const hasCancerHistory = profile.familyHistory.some(f => f.toLowerCase().includes("cancer"));

  const diseases: DiseaseRisk[] = [];

  // Cardiovascular Disease
  {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgSleep < 6) { score += 20; factors.push("Insufficient sleep (< 6 hours/night)"); }
    if (avgSleep < 7) { score += 10; factors.push("Below recommended sleep duration"); }
    if (avgExercise < 30) { score += 20; factors.push("Insufficient physical activity"); }
    if (avgStress > 6) { score += 15; factors.push("High stress levels"); }
    if (avgSmoking > 0) { score += 25; factors.push("Smoking habit detected"); }
    if (avgAlcohol > 2) { score += 10; factors.push("High alcohol consumption"); }
    if (bmi > 30) { score += 15; factors.push("BMI indicates obesity"); }
    if (hasHypertensionHistory) { score += 15; factors.push("Family history of hypertension"); }
    if (hasHeartHistory) { score += 20; factors.push("Family history of heart disease"); }
    if (profile.age > 50) { score += 10; factors.push("Age-related risk increase"); }
    score = Math.min(score, 95);
    if (avgExercise < 150) recs.push("Aim for at least 150 minutes of moderate exercise per week");
    if (avgSmoking > 0) recs.push("Quit smoking — it's the single biggest step to reduce heart risk");
    if (avgStress > 5) recs.push("Practice stress reduction techniques like meditation or yoga");
    recs.push("Maintain a diet low in saturated fats and high in vegetables");
    recs.push("Monitor blood pressure regularly");
    diseases.push({
      diseaseName: "Cardiovascular Disease",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors.length > 0 ? factors : ["No significant risk factors detected"],
      recommendations: recs,
    });
  }

  // Type 2 Diabetes
  {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgExercise < 30) { score += 20; factors.push("Low physical activity level"); }
    if (bmi > 25) { score += 15; factors.push("Elevated BMI"); }
    if (bmi > 30) { score += 10; factors.push("Obesity increases insulin resistance"); }
    if (avgSleep < 7) { score += 15; factors.push("Sleep deprivation impairs glucose metabolism"); }
    if (avgStress > 6) { score += 10; factors.push("Chronic stress elevates cortisol"); }
    if (hasDiabetesHistory) { score += 25; factors.push("Family history of diabetes"); }
    if (profile.age > 45) { score += 10; factors.push("Age over 45"); }
    if (avgAlcohol > 3) { score += 10; factors.push("Heavy alcohol use affects blood sugar"); }
    score = Math.min(score, 95);
    recs.push("Reduce refined carbohydrate and sugar intake");
    if (avgExercise < 30) recs.push("Add 30+ minutes of daily walking or exercise");
    recs.push("Get regular blood glucose screenings");
    if (bmi > 25) recs.push("Target a healthy weight through diet and exercise");
    diseases.push({
      diseaseName: "Type 2 Diabetes",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors.length > 0 ? factors : ["No significant risk factors detected"],
      recommendations: recs,
    });
  }

  // Sleep Disorders
  {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgSleep < 6) { score += 30; factors.push("Consistently sleeping less than 6 hours"); }
    else if (avgSleep < 7) { score += 15; factors.push("Below recommended 7-9 hours of sleep"); }
    if (avgSleep > 9) { score += 15; factors.push("Excessive sleep may indicate underlying issues"); }
    if (poorSleepRatio > 0.5) { score += 25; factors.push("Frequent poor or fair sleep quality reported"); }
    if (avgStress > 6) { score += 15; factors.push("High stress disrupts sleep cycles"); }
    if (avgScreenTime > 6) { score += 10; factors.push("Excessive screen time before bed"); }
    if (avgAlcohol > 1) { score += 10; factors.push("Alcohol disrupts sleep architecture"); }
    if (avgSmoking > 0) { score += 10; factors.push("Nicotine is a stimulant affecting sleep"); }
    score = Math.min(score, 95);
    recs.push("Maintain a consistent sleep schedule, even on weekends");
    recs.push("Avoid screens at least 1 hour before bedtime");
    if (avgStress > 5) recs.push("Try relaxation techniques before bed (breathing exercises, stretching)");
    recs.push("Keep your bedroom cool, dark, and quiet");
    diseases.push({
      diseaseName: "Chronic Sleep Disorder / Insomnia",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors.length > 0 ? factors : ["Good sleep patterns observed"],
      recommendations: recs,
    });
  }

  // Mental Health Disorders
  {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgStress > 7) { score += 25; factors.push("Chronically high stress levels"); }
    else if (avgStress > 5) { score += 12; factors.push("Elevated stress levels"); }
    if (avgSleep < 6) { score += 20; factors.push("Sleep deprivation increases anxiety and depression risk"); }
    if (avgExercise < 20) { score += 15; factors.push("Low physical activity (exercise reduces mental health risk)"); }
    if (avgMeditation === 0) { score += 10; factors.push("No mindfulness or meditation practice"); }
    if (avgAlcohol > 2) { score += 15; factors.push("Alcohol use is linked to mood disorders"); }
    if (avgScreenTime > 8) { score += 10; factors.push("Excessive screen time linked to anxiety"); }
    if (poorSleepRatio > 0.4) { score += 10; factors.push("Poor sleep quality affects mood regulation"); }
    score = Math.min(score, 95);
    recs.push("Exercise regularly — even 20-30 minutes of walking helps significantly");
    if (avgMeditation < 10) recs.push("Start a daily 10-minute mindfulness or meditation practice");
    recs.push("Build and maintain social connections");
    recs.push("Consider speaking with a mental health professional if stress persists");
    diseases.push({
      diseaseName: "Anxiety & Depression",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors.length > 0 ? factors : ["Good mental health indicators observed"],
      recommendations: recs,
    });
  }

  // Hypertension
  {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgStress > 6) { score += 20; factors.push("High stress elevates blood pressure"); }
    if (avgSmoking > 0) { score += 20; factors.push("Smoking raises blood pressure"); }
    if (avgAlcohol > 2) { score += 15; factors.push("Heavy alcohol use contributes to hypertension"); }
    if (avgSleep < 6) { score += 15; factors.push("Poor sleep is linked to high blood pressure"); }
    if (avgExercise < 30) { score += 10; factors.push("Insufficient exercise to maintain healthy blood pressure"); }
    if (bmi > 25) { score += 10; factors.push("Overweight increases hypertension risk"); }
    if (hasHypertensionHistory) { score += 20; factors.push("Family history of hypertension"); }
    if (profile.age > 40) { score += 10; factors.push("Age-related blood pressure increase"); }
    score = Math.min(score, 95);
    recs.push("Reduce sodium intake in your diet");
    recs.push("Exercise aerobically for at least 30 minutes most days");
    if (avgSmoking > 0) recs.push("Quitting smoking rapidly reduces blood pressure");
    recs.push("Monitor blood pressure at home regularly");
    diseases.push({
      diseaseName: "Hypertension (High Blood Pressure)",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors.length > 0 ? factors : ["No significant risk factors detected"],
      recommendations: recs,
    });
  }

  // Respiratory / Lung Disease
  if (avgSmoking > 0 || profile.familyHistory.some(f => f.toLowerCase().includes("lung") || f.toLowerCase().includes("asthma") || f.toLowerCase().includes("copd"))) {
    let score = 0;
    const factors: string[] = [];
    const recs: string[] = [];
    if (avgSmoking > 5) { score += 40; factors.push("Heavy smoking habit (>5 cigarettes/day)"); }
    else if (avgSmoking > 0) { score += 25; factors.push("Smoking habit detected"); }
    if (avgExercise < 20) { score += 10; factors.push("Poor lung fitness from low activity"); }
    if (profile.familyHistory.some(f => f.toLowerCase().includes("asthma"))) { score += 20; factors.push("Family history of asthma"); }
    if (profile.familyHistory.some(f => f.toLowerCase().includes("copd") || f.toLowerCase().includes("lung"))) { score += 20; factors.push("Family history of COPD/lung disease"); }
    score = Math.min(score, 95);
    if (avgSmoking > 0) recs.push("Quitting smoking is the most impactful action you can take");
    recs.push("Avoid secondhand smoke and air pollutants");
    recs.push("Practice breathing exercises to improve lung capacity");
    diseases.push({
      diseaseName: "Respiratory / Lung Disease",
      riskLevel: getRiskLevel(score),
      riskScore: score,
      predictedTimeframe: getTimeframe(score),
      contributingFactors: factors,
      recommendations: recs,
    });
  }

  // Sort by risk score descending
  diseases.sort((a, b) => b.riskScore - a.riskScore);

  // Overall health score (inverse of avg risk)
  const avgRisk = diseases.reduce((s, d) => s + d.riskScore, 0) / diseases.length;
  const overallHealthScore = Math.max(0, Math.min(100, Math.round(100 - avgRisk)));

  let summary = "";
  if (dataInsufficient) {
    summary = "Not enough data yet to make accurate predictions. Please log at least 3 days of sleep and habits for better results.";
  } else if (overallHealthScore >= 75) {
    summary = "Your health habits look great! Keep maintaining your current lifestyle to stay protected.";
  } else if (overallHealthScore >= 50) {
    summary = "You have some moderate health risks. Targeted improvements in sleep, exercise, and stress management can significantly lower your risk.";
  } else {
    summary = "Several high risk factors have been detected. We strongly recommend consulting a healthcare professional and making lifestyle changes.";
  }

  return { overallHealthScore, diseases, summary, dataInsufficient };
}
