export type Section = { heading: string; body: string[] };
export type Article = {
  id: string;
  title: string;
  summary?: string;
  sections: Section[];
};

/* -------------------- Manuals -------------------- */

export const manualCategories: Article[] = [
  {
    id: "before-opening",
    title: "Before Opening",
    summary: "Pre-service checklist — complete by 18:00.",
    sections: [
      {
        heading: "Bar setup",
        body: [
          "Turn on ice machine and verify output.",
          "Wipe down bar top, back-bar and speed rails.",
          "Refill garnish trays: citrus, olives, cherries.",
          "Check bottle levels — flag any below 20%.",
        ],
      },
      {
        heading: "Floor",
        body: [
          "Sweep and mop dance floor.",
          "Test lighting cues 1–4.",
          "Confirm reservations list with door team.",
        ],
      },
    ],
  },
  {
    id: "during-service",
    title: "During Service",
    summary: "Standards for peak hours.",
    sections: [
      {
        heading: "Guest flow",
        body: [
          "Greet guests within 30 seconds of seating.",
          "First drink served within 4 minutes.",
          "Clear empties every 10 minutes.",
        ],
      },
      {
        heading: "Communication",
        body: [
          "Use radio channel 2 for bar-to-floor.",
          "Report any incident to duty manager immediately.",
        ],
      },
    ],
  },
  {
    id: "closing",
    title: "Closing",
    summary: "End-of-night breakdown.",
    sections: [
      {
        heading: "Bar breakdown",
        body: [
          "Last call 30 min before close.",
          "Empty and rinse speed rails.",
          "Cover fruit trays and refrigerate.",
          "Wipe all bottles and reset back-bar.",
        ],
      },
      {
        heading: "Lock-up",
        body: [
          "Lock storage rooms.",
          "Set alarm, code 4-digit.",
          "Two staff sign the closing log.",
        ],
      },
    ],
  },
  {
    id: "cash-register",
    title: "Cash Register",
    summary: "POS and cash handling.",
    sections: [
      {
        heading: "Opening float",
        body: [
          "Count opening float: ¥30,000.",
          "Log in with personal PIN — never share.",
          "Print X-report at start of shift.",
        ],
      },
      {
        heading: "Cash-out",
        body: [
          "Print Z-report.",
          "Count drawer twice, seal in labeled envelope.",
          "Deposit in safe, log in ledger.",
        ],
      },
    ],
  },
  {
    id: "cleaning",
    title: "Cleaning",
    summary: "Daily and weekly cleaning tasks.",
    sections: [
      {
        heading: "Daily",
        body: [
          "Sanitize bar top every 2 hours.",
          "Clean glassware in three-sink method.",
          "Sweep dance floor after close.",
        ],
      },
      {
        heading: "Weekly",
        body: [
          "Deep clean beer lines every Monday.",
          "Descale ice machine — Thursday.",
          "Full bathroom deep clean — Sunday.",
        ],
      },
    ],
  },
];

/* -------------------- Equipment -------------------- */

export const equipmentCategories: Article[] = [
  {
    id: "dj-mixer",
    title: "DJ Mixer",
    summary: "Pioneer DJM-900NXS2.",
    sections: [
      {
        heading: "Power on",
        body: [
          "Turn on booth amplifier LAST, off FIRST.",
          "Power sequence: mixer → CDJs → amplifier.",
          "Confirm master gain at 0 dB before opening.",
        ],
      },
      {
        heading: "Troubleshooting",
        body: [
          "No sound: check channel fader and cross-fader assign.",
          "Hum: check ground lift on booth cable.",
        ],
      },
    ],
  },
  {
    id: "cdj",
    title: "CDJ",
    summary: "Pioneer CDJ-3000 × 2.",
    sections: [
      {
        heading: "Link setup",
        body: [
          "Connect both CDJs via LAN to switch.",
          "Assign player numbers 1 and 2.",
          "Format USB in exFAT before use.",
        ],
      },
    ],
  },
  {
    id: "turntable",
    title: "Turntable",
    summary: "Technics SL-1200MK7.",
    sections: [
      {
        heading: "Care",
        body: [
          "Never touch the needle with fingers.",
          "Replace stylus every 6 months.",
          "Keep dust cover closed when idle.",
        ],
      },
    ],
  },
  {
    id: "beer-server",
    title: "Beer Server",
    summary: "Draft system — 4 taps.",
    sections: [
      {
        heading: "Daily",
        body: [
          "Check CO₂ pressure: 0.15 MPa.",
          "Rinse tap heads with warm water.",
          "Verify chill temperature: 2–4°C.",
        ],
      },
      {
        heading: "Line cleaning",
        body: [
          "Every Monday: run cleaning solution through all lines.",
          "Flush with water for 5 minutes.",
        ],
      },
    ],
  },
  {
    id: "soda-gun",
    title: "Soda Gun",
    summary: "Post-mix soda system.",
    sections: [
      {
        heading: "Daily",
        body: [
          "Wipe nozzle with warm water.",
          "Test each button — confirm carbonation.",
          "Check BIB levels; swap when < 10%.",
        ],
      },
    ],
  },
];

/* -------------------- Emergency -------------------- */

export const emergencyCategories: Article[] = [
  {
    id: "gas-leak",
    title: "Gas Leak",
    summary: "If you smell gas — act immediately.",
    sections: [
      {
        heading: "Immediate action",
        body: [
          "DO NOT flip switches or use phones near the leak.",
          "Turn off main gas valve (behind kitchen).",
          "Open all doors and ventilate.",
          "Evacuate guests calmly to the street.",
        ],
      },
      {
        heading: "Contact",
        body: [
          "Tokyo Gas emergency: 0570-002211",
          "Duty manager — see contact card.",
        ],
      },
    ],
  },
  {
    id: "power-failure",
    title: "Power Failure",
    summary: "Loss of mains power.",
    sections: [
      {
        heading: "Immediate action",
        body: [
          "Emergency lights activate automatically — do not panic guests.",
          "Announce calmly: “The venue has a brief power interruption.”",
          "Stop service; secure the register drawer.",
        ],
      },
      {
        heading: "Restore",
        body: [
          "Check breaker room — reset main breaker.",
          "If not restored in 10 min, evacuate to street.",
        ],
      },
    ],
  },
  {
    id: "fire",
    title: "Fire",
    summary: "Follow this exact sequence.",
    sections: [
      {
        heading: "Immediate action",
        body: [
          "Activate fire alarm.",
          "Call 119.",
          "Evacuate via nearest exit — never elevator.",
          "Use extinguisher ONLY on small, contained fires.",
        ],
      },
      {
        heading: "Assembly point",
        body: ["Meet at the corner across from the venue. Head count immediately."],
      },
    ],
  },
  {
    id: "first-aid",
    title: "First Aid",
    summary: "Basic response protocols.",
    sections: [
      {
        heading: "Unconscious guest",
        body: [
          "Call 119 immediately.",
          "Check breathing; place in recovery position.",
          "Clear the area; assign one staff to meet paramedics at door.",
        ],
      },
      {
        heading: "Cuts / burns",
        body: [
          "First aid kit is behind the bar, left cabinet.",
          "For burns: cool running water for 10 minutes.",
          "Log every incident in the safety book.",
        ],
      },
    ],
  },
];
