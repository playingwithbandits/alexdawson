import { Meeting } from "@/types/raceday";

// Helper function to generate form data
const generateForm = (
  id: string,
  trackId: string,
  goingCodes: string[],
  jockey: string,
  baseRpr: number,
  baseTs: number,
  baseOr: number
) => {
  const rpr = baseRpr + Math.floor(Math.random() * 20) - 10;
  const ts = baseTs + Math.floor(Math.random() * 15) - 7;
  const or = baseOr + Math.floor(Math.random() * 15) - 7;

  return {
    id: `form_${id}`,
    raceDate: "2024-01-01",
    trackId,
    goingCodes,
    position: Math.floor(Math.random() * 8) + 1,
    racedAgainstRaw: [
      {
        id: `opponent_${id}`,
        name: `Opponent ${id}`,
        position: Math.floor(Math.random() * 8) + 1,
        distanceToWinner: Math.random() * 5,
        rpr: rpr - 5,
        ts: ts - 3,
        or: or - 3,
      },
    ],
    racedAgainstInfo: {
      rawData: {
        or: [or - 3],
        rpr: [rpr - 5],
        ts: [ts - 3],
      },
      averages: {
        or: or - 3,
        rpr: rpr - 5,
        ts: ts - 3,
      },
      maxes: {
        or: or - 3,
        rpr: rpr - 5,
        ts: ts - 3,
      },
    },
    racedAgainst_Beaten: [],
    racedAgainst_BeatenInfo: {
      rawData: {
        or: [],
        rpr: [],
        ts: [],
      },
      averages: {
        or: 0,
        rpr: 0,
        ts: 0,
      },
      maxes: {
        or: 0,
        rpr: 0,
        ts: 0,
      },
    },
    rpr,
    ts,
    or,
    raceClass: Math.floor(Math.random() * 3) + 1,
    distanceF: 16 + Math.floor(Math.random() * 12),
    totalRaceTime: 200 + Math.floor(Math.random() * 60),
    timePerFurlong: 11.5 + Math.random() * 2,
    raceType: Math.random() > 0.5 ? "Hurdle" : "Chase",
    raceTypeCode: Math.random() > 0.5 ? "H" : "C",
    jockey,
  };
};

// Helper function to generate horse data
const generateHorse = (
  id: string,
  name: string,
  baseRpr: number,
  baseTs: number,
  baseOr: number
) => {
  const forms = [];
  const jockeys = [
    "A P McCoy",
    "R Walsh",
    "J Culloty",
    "R Dunwoody",
    "B Geraghty",
  ];
  const tracks = ["Aintree", "Cheltenham", "Ascot", "Kempton", "Newbury"];
  const goingCodes = ["Good", "Soft", "Good to Firm", "Heavy"];

  for (let i = 1; i <= 10; i++) {
    const jockey = jockeys[Math.floor(Math.random() * jockeys.length)];
    const trackId = tracks[Math.floor(Math.random() * tracks.length)];
    const goingCode = goingCodes[Math.floor(Math.random() * goingCodes.length)];

    forms.push(
      generateForm(
        `${id}_${i}`,
        trackId,
        [goingCode],
        jockey,
        baseRpr,
        baseTs,
        baseOr
      )
    );
  }

  const rprValues = forms.map((f) => f.rpr);
  const tsValues = forms.map((f) => f.ts);
  const orValues = forms.map((f) => f.or);
  const distanceFValues = forms.map((f) => f.distanceF);
  const timePerFurlongValues = forms.map((f) => f.timePerFurlong);

  return {
    id: `horse_${id}`,
    name,
    jockey: jockeys[Math.floor(Math.random() * jockeys.length)],
    form: forms,
    formInfo: {
      rawData: {
        rpr: rprValues,
        ts: tsValues,
        or: orValues,
        distanceF: distanceFValues,
        trackId: forms.map((f) => f.trackId),
        goingCodes: forms.map((f) => f.goingCodes[0]),
        jockey: forms.map((f) => f.jockey),
        timePerFurlong: timePerFurlongValues,
        racedAgainst: {
          or: forms.map((f) => f.racedAgainstInfo.averages.or),
          rpr: forms.map((f) => f.racedAgainstInfo.averages.rpr),
          ts: forms.map((f) => f.racedAgainstInfo.averages.ts),
        },
        racedAgainst_Beaten: {
          or: [],
          rpr: [],
          ts: [],
        },
      },
      averages: {
        rpr: Math.round(
          rprValues.reduce((a, b) => a + b, 0) / rprValues.length
        ),
        ts: Math.round(tsValues.reduce((a, b) => a + b, 0) / tsValues.length),
        or: Math.round(orValues.reduce((a, b) => a + b, 0) / orValues.length),
        distanceF: Math.round(
          distanceFValues.reduce((a, b) => a + b, 0) / distanceFValues.length
        ),
        trackId: tracks[0],
        goingCode: goingCodes[0],
        jockey: jockeys[0],
        racedAgainst: {
          or: Math.round(
            forms
              .map((f) => f.racedAgainstInfo.averages.or)
              .reduce((a, b) => a + b, 0) / forms.length
          ),
          rpr: Math.round(
            forms
              .map((f) => f.racedAgainstInfo.averages.rpr)
              .reduce((a, b) => a + b, 0) / forms.length
          ),
          ts: Math.round(
            forms
              .map((f) => f.racedAgainstInfo.averages.ts)
              .reduce((a, b) => a + b, 0) / forms.length
          ),
        },
        racedAgainst_Beaten: {
          or: 0,
          rpr: 0,
          ts: 0,
        },
      },
      maxes: {
        rpr: Math.max(...rprValues),
        ts: Math.max(...tsValues),
        or: Math.max(...orValues),
        racedAgainst: {
          or: Math.max(...forms.map((f) => f.racedAgainstInfo.averages.or)),
          rpr: Math.max(...forms.map((f) => f.racedAgainstInfo.averages.rpr)),
          ts: Math.max(...forms.map((f) => f.racedAgainstInfo.averages.ts)),
        },
        racedAgainst_Beaten: {
          or: 0,
          rpr: 0,
          ts: 0,
        },
      },
      min: {
        timePerFurlong: Math.min(...timePerFurlongValues),
      },
    },
    rpr: Math.round(rprValues.reduce((a, b) => a + b, 0) / rprValues.length),
    ts: Math.round(tsValues.reduce((a, b) => a + b, 0) / tsValues.length),
    or: Math.round(orValues.reduce((a, b) => a + b, 0) / orValues.length),
  };
};

const MOCK_RACEDAYS: Meeting[] = [
  {
    trackId: "Cheltenham",
    races: [
      {
        id: "cheltenham_1",
        time: "14:30",
        title: "Cheltenham Gold Cup",
        distanceF: 26,
        goingCodes: ["Good"],
        horses: [
          generateHorse("1", "Red Rum", 150, 148, 145),
          generateHorse("2", "Desert Orchid", 145, 142, 140),
          generateHorse("3", "Kauto Star", 175, 172, 170),
          generateHorse("4", "Best Mate", 165, 162, 160),
          generateHorse("5", "Harbour Pilot", 155, 152, 150),
        ],
        horsesInfo: {
          averages: {
            rpr: 158,
            ts: 155,
            or: 153,
            racedAgainst: {
              or: 150,
              rpr: 153,
              ts: 151,
            },
            racedAgainst_Beaten: {
              or: 0,
              rpr: 0,
              ts: 0,
            },
          },
          maxes: {
            rpr: 175,
            ts: 172,
            or: 170,
            racedAgainst: {
              or: 165,
              rpr: 168,
              ts: 166,
            },
            racedAgainst_Beaten: {
              or: 0,
              rpr: 0,
              ts: 0,
            },
          },
          min: {
            timePerFurlong: 11.2,
          },
        },
      },
      {
        id: "cheltenham_2",
        time: "15:15",
        title: "Champion Hurdle",
        distanceF: 20,
        goingCodes: ["Good"],
        horses: [
          generateHorse("6", "Istabraq", 160, 158, 155),
          generateHorse("7", "Hurricane Fly", 158, 156, 153),
          generateHorse("8", "Rock On Ruby", 152, 150, 148),
          generateHorse("9", "Binocular", 154, 152, 150),
          generateHorse("10", "Punjabi", 150, 148, 146),
        ],
        horsesInfo: {
          averages: {
            rpr: 154.8,
            ts: 152.8,
            or: 150.4,
            racedAgainst: {
              or: 147,
              rpr: 150,
              ts: 148,
            },
            racedAgainst_Beaten: {
              or: 0,
              rpr: 0,
              ts: 0,
            },
          },
          maxes: {
            rpr: 160,
            ts: 158,
            or: 155,
            racedAgainst: {
              or: 152,
              rpr: 155,
              ts: 153,
            },
            racedAgainst_Beaten: {
              or: 0,
              rpr: 0,
              ts: 0,
            },
          },
          min: {
            timePerFurlong: 11.0,
          },
        },
      },
    ],
  },
];

export default MOCK_RACEDAYS;
