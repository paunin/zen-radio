export interface Station {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  source: "SomaFM" | "Radio Browser";
  votes?: number;
  clickcount?: number;
  clicktrend?: number;
  bitrate?: number;
  codec?: string;
  favicon?: string;
  country?: string;
  tags?: string;
}

export interface RadioBrowserStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  country: string;
  tags: string;
  codec: string;
  bitrate: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
}
