import { determineRunStyle } from "./scores/funcs";

interface CommentAnalysis {
  score: number;
  sentiment: "positive" | "negative" | "neutral";
  runStyle?: "leader" | "prominent" | "midfield" | "held up";
  performance: {
    jumping?: "good" | "poor" | "mixed";
    finishing?: "strong" | "weak" | "steady";
    behavior?: "keen" | "settled" | "awkward";
    position?: "improved" | "maintained" | "weakened";
    courseAndDistance?: "winner" | "placed" | "poor";
    absence?: "fresh" | "returning" | "long_layoff";
    market?: "well_backed" | "big_odds" | "gambled";
    breathing?: "wind_op" | "respiratory_issue" | "tongue_tie";
    headgear?: "first_time" | "retained" | "removed";
    yard?: "in_form" | "change" | "debut";
    ground?: "acts" | "query" | "untested";
    class?: "drop" | "rise" | "same";
    rating?: "well_treated" | "high_mark" | "out_of_handicap";
    trip?: "proven" | "unproven" | "stamina_query";
    price?: "expensive" | "modest" | "unknown";
    pedigree?: "well_bred" | "modest_bred" | "interesting";
    code_switch?: "flat_to_jumps" | "jumps_to_flat" | "point_to_rules";
  };
  keywords: string[];
}

const PERFORMANCE_INDICATORS = {
  jumping: {
    good: [
      "jumped well",
      "good jump",
      "fluent",
      "neat jump",
      "accurate",
      "clear round",
    ],
    poor: [
      "mistake",
      "blundered",
      "not fluent",
      "stumbled",
      "hit",
      "pecked",
      "fell",
      "unseated",
      "refused",
    ],
    mixed: [
      "jumped left",
      "jumped right",
      "patchy jumping",
      "careful",
      "sketchy",
    ],
  },
  finishing: {
    strong: [
      "stayed on",
      "ran on",
      "kept on",
      "finished well",
      "rallied",
      "powered",
      "quickened",
      "cruised",
    ],
    weak: [
      "weakened",
      "faded",
      "tired",
      "no extra",
      "one paced",
      "never threatened",
      "never involved",
      "never dangerous",
      "tailed off",
    ],
    steady: ["maintained", "plugged on", "kept on", "stayed on", "one paced"],
  },
  behavior: {
    keen: [
      "pulled",
      "keen",
      "free",
      "rushed",
      "raced freely",
      "took keen hold",
      "did too much up front",
    ],
    settled: [
      "settled",
      "relaxed",
      "tracked",
      "covered up",
      "switched off",
      "in touch",
    ],
    awkward: [
      "awkward",
      "green",
      "hesitant",
      "wayward",
      "hanging",
      "running loose",
      "blow start",
    ],
  },
  position: {
    improved: [
      "headway",
      "progress",
      "challenged",
      "went second",
      "went third",
      "made ground",
    ],
    maintained: [
      "tracked",
      "followed",
      "chased",
      "in touch",
      "prominent",
      "made all",
      "front running",
    ],
    weakened: [
      "lost position",
      "dropped back",
      "outpaced",
      "lost touch",
      "remote",
      "never nearer",
      "detached",
    ],
  },
  courseAndDistance: {
    winner: ["C&D winner", "course winner", "won here", "scored here"],
    placed: ["C&D form", "gone close here", "placed here", "runner up here"],
    poor: ["struggled here", "below par here", "poor course form"],
  },
  absence: {
    fresh: ["fresh", "well rested", "comes here fresh"],
    returning: ["returning from break", "back from absence", "reappearance"],
    long_layoff: ["long absence", "lengthy break", "time off", "days off"],
  },
  market: {
    well_backed: ["well backed", "market support", "favourite", "gambled on"],
    big_odds: ["big odds", "outsider", "unfancied"],
    gambled: ["landed gamble", "heavily backed", "strong market support"],
  },
  breathing: {
    wind_op: ["wind op", "wind surgery", "breathing operation"],
    respiratory_issue: [
      "made a noise",
      "respiratory noise",
      "breathing issues",
    ],
    tongue_tie: ["tongue tied", "tongue tie", "tongue strap"],
  },
  headgear: {
    first_time: [
      "first-time hood",
      "first-time cheekpieces",
      "first-time blinkers",
      "tries headgear",
      "headgear added",
    ],
    retained: ["retained headgear", "keeps the", "remains in", "back in"],
    removed: [
      "headgear removed",
      "headgear is off",
      "without headgear",
      "minus the",
    ],
  },
  yard: {
    in_form: [
      "in-form yard",
      "yard in form",
      "good record",
      "going well",
      "stable in form",
    ],
    change: [
      "stable debut",
      "yard debut",
      "new stable",
      "new yard",
      "new connections",
      "trainer changes",
    ],
    debut: [
      "stable debut",
      "yard debut",
      "first run for",
      "first start for",
      "debut for new yard",
    ],
  },
  ground: {
    acts: [
      "acts well",
      "good form on",
      "handles",
      "proven on",
      "effective on",
      "goes well on",
    ],
    query: [
      "ground query",
      "surface query",
      "untested on",
      "unproven on",
      "yet to race on",
    ],
    untested: ["unraced on", "first time on", "never raced on", "untried on"],
  },
  class: {
    drop: [
      "drops in grade",
      "drop in class",
      "easier grade",
      "lower grade",
      "much easier level",
    ],
    rise: [
      "steps up in grade",
      "up in class",
      "tougher grade",
      "higher grade",
      "faces a tougher task",
    ],
    same: ["same grade", "same level", "similar grade", "this level"],
  },
  rating: {
    well_treated: [
      "well treated",
      "well handicapped",
      "handy mark",
      "good mark",
      "dropped to a dangerous mark",
      "slipped to a handy mark",
    ],
    high_mark: [
      "high in weights",
      "badly treated",
      "high mark",
      "looks high enough",
      "might be high enough",
    ],
    out_of_handicap: [
      "out of handicap",
      "wrong at the weights",
      "out of the weights",
      "badly out",
      "wrong side of handicap",
    ],
  },
  trip: {
    proven: [
      "proven at trip",
      "won over",
      "effective at",
      "handles the trip",
      "stays well",
      "proven stamina",
    ],
    unproven: [
      "first try at",
      "tries this trip",
      "upped in distance",
      "step up in trip",
      "new trip",
    ],
    stamina_query: [
      "stamina to prove",
      "stamina not proven",
      "stamina query",
      "might not stay",
      "unproven at trip",
    ],
  },
  price: {
    expensive: [
      "£200,000",
      "€100,000",
      "expensive purchase",
      "costly buy",
      "high price tag",
    ],
    modest: ["cheap purchase", "modest price", "bargain buy", "inexpensive"],
    unknown: ["price not disclosed", "private purchase", "price unknown"],
  },
  pedigree: {
    well_bred: [
      "well bred",
      "good pedigree",
      "classy pedigree",
      "by leading sire",
      "well related",
      "closely related",
    ],
    modest_bred: [
      "modest pedigree",
      "unfashionable breeding",
      "lesser known sire",
    ],
    interesting: [
      "interesting pedigree",
      "bred to be better",
      "breeding suggests",
      "bred for this",
    ],
  },
  code_switch: {
    flat_to_jumps: ["flat bred", "ex flat", "flat winner", "from the flat"],
    jumps_to_flat: ["reverting to flat", "back on flat", "switching to flat"],
    point_to_rules: [
      "point winner",
      "pointing",
      "between the flags",
      "irish point",
    ],
  },
};

const POSITIVE_PHRASES = [
  "won",
  "scored",
  "impressive",
  "easily",
  "comfortably",
  "readily",
  "clear",
  "well",
  "good",
  "smooth",
  "strong",
  "promising",
  "progressive",
  "improved",
  "going well",
  "travelled well",
  "cruised",
  "quickened",
  "powered",
  "dominated",
  "commanded",
  "flourishing",
  "thriving",
  "cosy",
  "taking",
  "solid",
  "reliable",
  "consistent",
  "progressive",
];

const NEGATIVE_PHRASES = [
  "struggled",
  "poor",
  "disappointing",
  "never",
  "labored",
  "failed",
  "beaten",
  "detached",
  "tailed off",
  "pulled up",
  "fell",
  "unseated",
  "refused",
  "broke down",
  "bled",
  "lost action",
  "lost all chance",
  "never involved",
  "never dangerous",
  "never competitive",
  "below par",
  "modest",
  "regressive",
  "stagnated",
  "exposed",
];

export function analyzeRacingPostHorseComment(
  comment: string
): CommentAnalysis {
  const lowerComment = comment.toLowerCase();
  let score = 0;
  const keywords: string[] = [];

  // Initialize performance analysis
  const performance: CommentAnalysis["performance"] = {};

  // Analyze jumping
  if (lowerComment.includes("jump") || lowerComment.includes("fence")) {
    if (
      PERFORMANCE_INDICATORS.jumping.good.some((term) =>
        lowerComment.includes(term)
      )
    ) {
      performance.jumping = "good";
      score += 2;
    } else if (
      PERFORMANCE_INDICATORS.jumping.poor.some((term) =>
        lowerComment.includes(term)
      )
    ) {
      performance.jumping = "poor";
      score -= 2;
    } else if (
      PERFORMANCE_INDICATORS.jumping.mixed.some((term) =>
        lowerComment.includes(term)
      )
    ) {
      performance.jumping = "mixed";
      score -= 0.5;
    }
  }

  // Analyze finishing effort
  if (
    PERFORMANCE_INDICATORS.finishing.strong.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.finishing = "strong";
    score += 2;
  } else if (
    PERFORMANCE_INDICATORS.finishing.weak.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.finishing = "weak";
    score -= 2;
  } else if (
    PERFORMANCE_INDICATORS.finishing.steady.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.finishing = "steady";
    score += 0.5;
  }

  // Analyze behavior
  if (
    PERFORMANCE_INDICATORS.behavior.keen.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.behavior = "keen";
    score -= 0.5;
  } else if (
    PERFORMANCE_INDICATORS.behavior.settled.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.behavior = "settled";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.behavior.awkward.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.behavior = "awkward";
    score -= 1;
  }

  // Analyze positional movement
  if (
    PERFORMANCE_INDICATORS.position.improved.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.position = "improved";
    score += 1.5;
  } else if (
    PERFORMANCE_INDICATORS.position.weakened.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.position = "weakened";
    score -= 1.5;
  } else if (
    PERFORMANCE_INDICATORS.position.maintained.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.position = "maintained";
    score += 0.5;
  }

  // Analyze course and distance form
  if (
    PERFORMANCE_INDICATORS.courseAndDistance.winner.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.courseAndDistance = "winner";
    score += 2;
  } else if (
    PERFORMANCE_INDICATORS.courseAndDistance.placed.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.courseAndDistance = "placed";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.courseAndDistance.poor.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.courseAndDistance = "poor";
    score -= 1;
  }

  // Analyze absence/freshness
  if (
    PERFORMANCE_INDICATORS.absence.fresh.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.absence = "fresh";
    score += 0.5;
  } else if (
    PERFORMANCE_INDICATORS.absence.returning.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.absence = "returning";
  } else if (
    PERFORMANCE_INDICATORS.absence.long_layoff.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.absence = "long_layoff";
    score -= 0.5;
  }

  // Analyze market position
  if (
    PERFORMANCE_INDICATORS.market.well_backed.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.market = "well_backed";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.market.big_odds.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.market = "big_odds";
    score -= 0.5;
  } else if (
    PERFORMANCE_INDICATORS.market.gambled.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.market = "gambled";
    score += 1.5;
  }

  // Analyze breathing/wind operations
  if (
    PERFORMANCE_INDICATORS.breathing.wind_op.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.breathing = "wind_op";
  } else if (
    PERFORMANCE_INDICATORS.breathing.respiratory_issue.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.breathing = "respiratory_issue";
    score -= 1;
  } else if (
    PERFORMANCE_INDICATORS.breathing.tongue_tie.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.breathing = "tongue_tie";
  }

  // Analyze headgear
  if (
    PERFORMANCE_INDICATORS.headgear.first_time.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.headgear = "first_time";
    // No score adjustment as impact is uncertain
  } else if (
    PERFORMANCE_INDICATORS.headgear.retained.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.headgear = "retained";
    score += 0.5; // Slight positive as retention usually indicates it helped
  } else if (
    PERFORMANCE_INDICATORS.headgear.removed.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.headgear = "removed";
    // No score adjustment as impact is uncertain
  }

  // Analyze yard form/changes
  if (
    PERFORMANCE_INDICATORS.yard.in_form.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.yard = "in_form";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.yard.change.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.yard = "change";
    // No score adjustment as impact is uncertain
  } else if (
    PERFORMANCE_INDICATORS.yard.debut.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.yard = "debut";
    // No score adjustment as impact is uncertain
  }

  // Analyze ground suitability
  if (
    PERFORMANCE_INDICATORS.ground.acts.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.ground = "acts";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.ground.query.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.ground = "query";
    score -= 0.5;
  } else if (
    PERFORMANCE_INDICATORS.ground.untested.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.ground = "untested";
    // No score adjustment as impact is uncertain
  }

  // Analyze class movement
  if (
    PERFORMANCE_INDICATORS.class.drop.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.class = "drop";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.class.rise.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.class = "rise";
    score -= 0.5;
  } else if (
    PERFORMANCE_INDICATORS.class.same.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.class = "same";
    // No score adjustment
  }

  // Analyze handicap mark
  if (
    PERFORMANCE_INDICATORS.rating.well_treated.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.rating = "well_treated";
    score += 1.5;
  } else if (
    PERFORMANCE_INDICATORS.rating.high_mark.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.rating = "high_mark";
    score -= 1;
  } else if (
    PERFORMANCE_INDICATORS.rating.out_of_handicap.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.rating = "out_of_handicap";
    score -= 1.5;
  }

  // Analyze trip suitability
  if (
    PERFORMANCE_INDICATORS.trip.proven.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.trip = "proven";
    score += 1.5;
  } else if (
    PERFORMANCE_INDICATORS.trip.unproven.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.trip = "unproven";
    // No score adjustment as impact uncertain
  } else if (
    PERFORMANCE_INDICATORS.trip.stamina_query.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.trip = "stamina_query";
    score -= 1;
  }

  // Analyze purchase price
  if (
    PERFORMANCE_INDICATORS.price.expensive.some((term) =>
      lowerComment.includes(term)
    ) ||
    /[£€]\d{6,}/.test(lowerComment) // Match 6+ digit prices
  ) {
    performance.price = "expensive";
    score += 0.5; // Small positive as expensive doesn't always mean better
  } else if (
    PERFORMANCE_INDICATORS.price.modest.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.price = "modest";
    // No score adjustment
  } else if (
    PERFORMANCE_INDICATORS.price.unknown.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.price = "unknown";
    // No score adjustment
  }

  // Analyze pedigree
  if (
    PERFORMANCE_INDICATORS.pedigree.well_bred.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.pedigree = "well_bred";
    score += 1;
  } else if (
    PERFORMANCE_INDICATORS.pedigree.modest_bred.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.pedigree = "modest_bred";
    score -= 0.5;
  } else if (
    PERFORMANCE_INDICATORS.pedigree.interesting.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.pedigree = "interesting";
    score += 0.5;
  }

  // Analyze code switches
  if (
    PERFORMANCE_INDICATORS.code_switch.flat_to_jumps.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.code_switch = "flat_to_jumps";
    // No score adjustment as impact varies
  } else if (
    PERFORMANCE_INDICATORS.code_switch.jumps_to_flat.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.code_switch = "jumps_to_flat";
    // No score adjustment as impact varies
  } else if (
    PERFORMANCE_INDICATORS.code_switch.point_to_rules.some((term) =>
      lowerComment.includes(term)
    )
  ) {
    performance.code_switch = "point_to_rules";
    // No score adjustment as impact varies
  }

  // Analyze positive phrases
  POSITIVE_PHRASES.forEach((phrase) => {
    if (lowerComment.includes(phrase)) {
      score += 1;
      keywords.push(phrase);
    }
  });

  // Analyze negative phrases
  NEGATIVE_PHRASES.forEach((phrase) => {
    if (lowerComment.includes(phrase)) {
      score -= 1;
      keywords.push(phrase);
    }
  });

  // Determine run style using existing function
  const runStyle = determineRunStyle([{ rpCloseUpComment: comment }]);

  // Determine overall sentiment
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  if (score > 1) {
    sentiment = "positive";
  } else if (score < -1) {
    sentiment = "negative";
  }

  return {
    score,
    sentiment,
    runStyle,
    performance,
    keywords,
  };
}
