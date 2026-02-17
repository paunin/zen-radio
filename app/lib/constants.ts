import type { Station } from "~/types/station";

export const DEFAULT_VOLUME = 75;
export const MAX_RECENT = 50;
export const SEARCH_DEBOUNCE_MS = 400;
export const MIN_SEARCH_LENGTH = 2;

export const PRESET_STATIONS: Station[] = [
  {
    id: "soma-groovesalad",
    name: "Groove Salad",
    description: "Ambient/downtempo",
    streamUrl: "https://ice4.somafm.com/groovesalad-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-dronezone",
    name: "Drone Zone",
    description: "Atmospheric ambient",
    streamUrl: "https://ice4.somafm.com/dronezone-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-lush",
    name: "Lush",
    description: "Sensuous mellow vocals",
    streamUrl: "https://ice4.somafm.com/lush-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-spacestation",
    name: "Space Station Soma",
    description: "Space electronica",
    streamUrl: "https://ice4.somafm.com/spacestation-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-defcon",
    name: "DEF CON Radio",
    description: "Music for hacking",
    streamUrl: "https://ice4.somafm.com/defcon-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-illstreet",
    name: "Illinois Street Lounge",
    description: "Lounge & exotica",
    streamUrl: "https://ice4.somafm.com/illstreet-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-indiepop",
    name: "Indie Pop Rocks!",
    description: "Indie pop favorites",
    streamUrl: "https://ice4.somafm.com/indiepop-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-u80s",
    name: "Underground 80s",
    description: "Synthpop & new wave",
    streamUrl: "https://ice4.somafm.com/u80s-128-mp3",
    source: "SomaFM",
  },
  {
    id: "soma-folkfwd",
    name: "Folk Forward",
    description: "Indie folk & alt-folk",
    streamUrl: "https://ice4.somafm.com/folkfwd-128-mp3",
    source: "SomaFM",
  },
];
