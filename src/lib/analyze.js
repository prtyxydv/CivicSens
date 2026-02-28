export function analyzeInput(text) {
  const input = String(text || "").toLowerCase();
  let result = {
    cat: "Maintenance",
    prio: 1,
    msg: "Routine urban logging.",
    time: "3-5 Business Days",
  };

  if (/(pothole|road|bridge|crack|asphalt)/.test(input)) {
    result = {
      cat: "Infrastructure",
      prio: 2,
      msg: "Structural integrity risk detected.",
      time: "24-48 Hours",
    };
  } else if (/(leak|water|flood|drain|sewage|pipe)/.test(input)) {
    result = {
      cat: "Utilities",
      prio: 3,
      msg: "Critical resource breach detected.",
      time: "Under 4 Hours",
    };
  } else if (/(danger|wire|fire|hazard|collapsed|electric)/.test(input)) {
    result = {
      cat: "Emergency",
      prio: 3,
      msg: "Immediate public safety hazard.",
      time: "Under 1 Hour (Dispatching Now)",
    };
  } else if (/(trash|garbage|waste|smell|litter)/.test(input)) {
    result = {
      cat: "Sanitation",
      prio: 1,
      msg: "Environmental hygiene log.",
      time: "48-72 Hours",
    };
  }

  return result;
}

