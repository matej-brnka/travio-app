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
  timeFrom?: string;
  timeTo?: string;
  googlePlaceId?: string;
}
