export class CreatePlaceDto {
  name: string;
  dayId?: string;
  emoji?: string;
  address?: string;
  website?: string;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  ticket?: 'none' | 'need' | 'have';
  priority?: 'must-see' | 'chci-videt' | 'mozna';
  note?: string;
  visited?: boolean;
  timeFrom?: string;
  timeTo?: string;
  googlePlaceId?: string;
}
