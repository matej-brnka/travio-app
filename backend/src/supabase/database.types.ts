export interface Trip {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  date_from: string;
  date_to: string;
  interests: string[] | null;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Day {
  id: string;
  trip_id: string;
  date: string;
  position: number;
  created_at: string;
}

export interface Place {
  id: string;
  trip_id: string;
  day_id: string | null;
  name: string;
  emoji: string | null;
  address: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: string[] | null;
  ticket: 'none' | 'need' | 'have' | null;
  visited: boolean;
  note: string | null;
  priority: 'must-see' | 'chci-videt' | 'mozna' | null;
  time_from: string | null;
  time_to: string | null;
  position: number;
  google_place_id: string | null;
  created_at: string;
  updated_at: string;
}
