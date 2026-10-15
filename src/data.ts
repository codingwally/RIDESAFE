export type Place = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
};
export type Report = {
  id: string;
  type: string;
  description: string;
  location: string;
  lat?: number;
  lon?: number;
  created: string;
  demo: boolean;
};
export type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  created: string;
  demo: boolean;
};
export const places: Place[] = [
  {
    id: "manila",
    name: "Rizal Park",
    area: "Manila · Metro Manila",
    lat: 14.5826,
    lon: 120.9787,
  },
  {
    id: "qc",
    name: "Quezon Memorial Circle",
    area: "Quezon City · Metro Manila",
    lat: 14.6516,
    lon: 121.0493,
  },
  {
    id: "bgc",
    name: "Bonifacio High Street",
    area: "Taguig · Metro Manila",
    lat: 14.5508,
    lon: 121.0501,
  },
  {
    id: "moa",
    name: "SM Mall of Asia",
    area: "Pasay · Metro Manila",
    lat: 14.5352,
    lon: 120.9822,
  },
  {
    id: "intramuros",
    name: "Fort Santiago",
    area: "Intramuros · Metro Manila",
    lat: 14.5942,
    lon: 120.9707,
  },
  {
    id: "clark",
    name: "Clark Parade Grounds",
    area: "Clark · Pampanga",
    lat: 15.1813,
    lon: 120.5226,
  },
  {
    id: "angeles",
    name: "Holy Rosary Parish Church",
    area: "Angeles · Pampanga",
    lat: 15.1359,
    lon: 120.5904,
  },
  {
    id: "sanfernando",
    name: "Metropolitan Cathedral",
    area: "San Fernando · Pampanga",
    lat: 15.0287,
    lon: 120.6927,
  },
];
export const start: Place = {
  id: "start",
  name: "Manila city center",
  area: "Default departure · not GPS",
  lat: 14.5995,
  lon: 120.9842,
};
export const sampleReports: Report[] = [
  {
    id: "demo-1",
    type: "Pothole",
    description:
      "Example report: uneven road surface near an intersection. Slow down and leave space.",
    location: "Manila · illustrative location",
    lat: 14.605,
    lon: 120.987,
    created: "Sample scenario",
    demo: true,
  },
  {
    id: "demo-2",
    type: "Flooding",
    description:
      "Example report: water across the road after heavy rain. Never enter floodwater of unknown depth.",
    location: "Quezon City · illustrative location",
    lat: 14.643,
    lon: 121.042,
    created: "Sample scenario",
    demo: true,
  },
  {
    id: "demo-3",
    type: "Roadworks",
    description:
      "Example report: a narrowed lane with loose material. Follow posted signs.",
    location: "San Fernando · illustrative location",
    lat: 15.031,
    lon: 120.69,
    created: "Sample scenario",
    demo: true,
  },
];
export const samplePosts: Post[] = [
  {
    id: "p1",
    title: "A good ride starts before the engine does.",
    body: "Try a quick pre-ride check: tires, brakes, lights, mirrors, and your helmet fit. What is on your checklist?",
    category: "Discussion",
    created: "Sample discussion",
    demo: true,
  },
  {
    id: "p2",
    title: "Make room for a safer road",
    body: "Sample campaign: give other road users space, make yourself visible, and choose a speed suited to conditions.",
    category: "Safety campaign",
    created: "Illustrative campaign · no scheduled event",
    demo: true,
  },
  {
    id: "p3",
    title: "Learn together. Ride better.",
    body: "Example event idea: a community helmet-fit and first-aid workshop. This is not a real event listing.",
    category: "Education event",
    created: "Example only · not an invitation",
    demo: true,
  },
];
export const lessons = [
  {
    id: "defensive",
    title: "Read the road ahead",
    topic: "Defensive riding",
    minutes: 3,
    body: "Look well ahead, scan intersections, and keep an escape space. Increase your following distance in rain or poor visibility. Assume another driver may not see you; use predictable signals and avoid blind spots.",
    question: "Rain reduces visibility. What is the best response?",
    options: [
      "Close the gap to the rider ahead",
      "Reduce speed and increase following distance",
      "Use hazard lights to ride faster",
    ],
    answer: 1,
  },
  {
    id: "helmet",
    title: "Your most important riding gear",
    topic: "Helmets & protection",
    minutes: 2,
    body: "Use a properly fitting, standard protective motorcycle helmet with a PS mark or ICC sticker as applicable under Philippine requirements. Fasten the chin strap on every ride. Check manufacturer guidance after an impact and replace damaged protection.",
    question: "Before setting off, your helmet should be…",
    options: [
      "Fastened and correctly fitted",
      "Loose enough to turn freely",
      "Carried on the handlebar",
    ],
    answer: 0,
  },
  {
    id: "emergency",
    title: "Be ready when it matters",
    topic: "Emergency response",
    minutes: 4,
    body: "Stop only where safe and protect yourself from traffic. Call 911 for an emergency and give a clear location. Avoid moving an injured rider or removing their helmet unless needed for immediate lifesaving care by someone trained. Follow dispatcher instructions.",
    question: "What should you do first at a crash scene?",
    options: [
      "Immediately remove the rider’s helmet",
      "Move the injured rider regardless of danger",
      "Check scene safety and call for help",
    ],
    answer: 2,
  },
  {
    id: "focus",
    title: "One road. Your full attention.",
    topic: "Focus & awareness",
    minutes: 2,
    body: "Set your destination before moving. Park safely before typing, reporting a hazard, or changing your route. A phone mount is not permission to be distracted. Keep devices out of your line of sight and follow applicable road rules.",
    question: "You need to change your destination. You should…",
    options: [
      "Type while stopped at a red light",
      "Pull over and park safely first",
      "Ask the rider behind to steer",
    ],
    answer: 1,
  },
];
export const offers = [
  {
    brand: "Honda",
    category: "Protective gear",
    amount: "10% OFF",
    threshold: 70,
  },
  {
    brand: "Kawasaki",
    category: "Safety inspection",
    amount: "₱150 OFF",
    threshold: 80,
  },
  {
    brand: "Suzuki",
    category: "Riding essentials",
    amount: "15% OFF",
    threshold: 85,
  },
  {
    brand: "Yamaha",
    category: "Helmet accessories",
    amount: "₱200 OFF",
    threshold: 90,
  },
];
