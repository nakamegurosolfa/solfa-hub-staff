export type Section = { heading: string; body: string[] };
export type Article = {
  id: string;
  title: string;
  summary?: string;
  sections: Section[];
};

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
