export const images = {
  hero: require("../assets/hero-osaka-office.png"),
  beforeAfter: require("../assets/before-after.png"),
  detail: require("../assets/detail-matters.png"),
  dreams: require("../assets/dreams-reality.png"),
  poster: require("../assets/poster-wall.png"),
  building: require("../assets/building-more.png")
};

export const customerWorks = [
  { id: "01", title: "Before / After", image: images.beforeAfter, tag: "Renovation" },
  { id: "02", title: "Every Detail Matters", image: images.detail, tag: "Craft" },
  { id: "03", title: "Dreams Into Reality", image: images.dreams, tag: "Custom Home" }
];

export const leads = [
  { id: "L-1024", name: "Chen Family", type: "Custom home", status: "Hot", budget: "¥23M", language: "中文" },
  { id: "L-1023", name: "Miller", type: "Renovation", status: "Estimate", budget: "¥8M", language: "EN" },
  { id: "L-1022", name: "Tanaka", type: "Store", status: "Visit", budget: "¥14M", language: "日本語" }
];

export const projects = [
  { id: "P-210", name: "Izumisano renovation", stage: 72, next: "Interior finish approval" },
  { id: "P-209", name: "Kansai second home", stage: 45, next: "Structure review" },
  { id: "P-208", name: "Osaka office fit-out", stage: 28, next: "Material estimate" }
];

export const campaignIdeas = [
  "Before-after renovation offer",
  "English consultation week",
  "Chinese New Year second-home campaign"
];
