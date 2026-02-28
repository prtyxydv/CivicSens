export function analyzeInput(text) {
  const input = String(text || "").toLowerCase();
  
  // Default structure matching production AI
  let result = {
    cat: "General Maintenance",
    prio: 1,
    msg: "Routine urban logging.",
    time: "3-5 Business Days",
    dept: "Public Works",
    score: 15
  };

  if (/(pothole|road|bridge|crack|asphalt)/.test(input)) {
    result = {
      cat: "Structural Engineering",
      prio: 4,
      msg: "Surface degradation detected. Monitoring for structural failure.",
      time: "2-3 Business Days",
      dept: "DOT",
      score: 45
    };
  } else if (/(leak|water|flood|drain|sewage|pipe)/.test(input)) {
    result = {
      cat: "Utility Systems",
      prio: 7,
      msg: "Hydraulic pressure anomaly or fluid breach detected.",
      time: "Under 12 Hours",
      dept: "Water & Power",
      score: 75
    };
  } else if (/(danger|wire|fire|hazard|collapsed|electric|gas)/.test(input)) {
    result = {
      cat: "Public Safety",
      prio: 10,
      msg: "Immediate threat to life or property detected.",
      time: "Emergency Dispatch",
      dept: "Emergency Services",
      score: 95
    };
  } else if (/(trash|garbage|waste|smell|litter)/.test(input)) {
    result = {
      cat: "Sanitation",
      prio: 2,
      msg: "Environmental hygiene and waste management log.",
      time: "48-72 Hours",
      dept: "Public Works",
      score: 25
    };
  }

  return result;
}
