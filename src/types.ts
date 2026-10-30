
export const STATUSES = [
  { id: "roster", label: "In Roster" },
  { id: "playable", label: "Playable" },
  { id: "nuh-uh", label: "Nuh uh" },
  { id: "testing", label: "More testing" },
  { id: "not-tested", label: "Not tested" },
] as const;

export type StatusId = (typeof STATUSES)[number]["id"];

export interface Role {
  id: string;
  name: string;
  color: string;
}

export interface Hero {
  id: string;
  name: string;
  image: string;
  status: StatusId;
  roles: string[];
  hasBuild: boolean;
  note: string;
  order: number;
}

export interface AppData {
  heroes: Hero[];
  roles: Role[];
}

export const DEFAULT_ROLES: Role[] = [
  { id: "role-1", name: "Role 1", color: "#e87979" },
  { id: "role-2", name: "Role 2", color: "#e9a45b" },
  { id: "role-3", name: "Role 3", color: "#e5cf65" },
  { id: "role-4", name: "Role 4", color: "#75bd8a" },
  { id: "role-5", name: "Role 5", color: "#70a9dc" },
  { id: "role-6", name: "Role 6", color: "#ae88d8" },
];


const HERO_FILES = [
  "Abrams_card.webp",
  "Apollo_card.webp",
  "Baba_card.webp",
  "Bebop_card.webp",
  "Billy_card.webp",
  "Calico_card.webp",
  "Celeste_card.webp",
  "Danny_card.png",
  "Doorman_card.webp",
  "Drifter_card.webp",
  "Dynamo_card.webp",
  "Geist_card.webp",
  "Graves_card.webp",
  "Harrow_card.png",
  "Haze_card.webp",
  "Holliday_card.webp",
  "Infernus_card.webp",
  "Ivy_card.webp",
  "Kelvin_card.webp",
  "Lash_card.webp",
  "McGinnis_card.webp",
  "Mina_card.webp",
  "Mirage_card.webp",
  "Mo_card.webp",
  "Paige_card.webp",
  "Paradox_card.webp",
  "Pocket_card.webp",
  "Ratking_card.webp",
  "Rem_card.webp",
  "Seven_card.webp",
  "Shiv_card.webp",
  "Silver_card.webp",
  "Sinclair_card.webp",
  "Solomon_card.webp",
  "Talon_card.webp",
  "Venator_card.webp",
  "Victor_card.webp",
  "Vindicta_card.webp",
  "Violet_card.png",
  "Viscous_card.webp",
  "Vyper_card.webp",
  "Warden_card.webp",
  "Wraith_card.webp",
  "Yamato_card.webp",
];

export const DEFAULT_DATA: AppData = {
  heroes: HERO_FILES.map((file, index) => ({
    id: file.replace("_card.webp", "").replace("_card.png", "").toLowerCase(),
    name: file.replace("_card.webp", "").replace("_card.png", "").replace("_card", ""),
    image: `/heroes/${file}`,
    status: "not-tested",
    roles: [],
    hasBuild: false,
    note: "",
    order: index,
  })),
  roles: DEFAULT_ROLES,
};

