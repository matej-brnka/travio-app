export class UpdatePlaceDto {
  name?: string;
  emoji?: string;
  address?: string;
  website?: string;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  ticket?: 'none' | 'need' | 'have' | null;
  visited?: boolean;
  note?: string;
  priority?: 'must-see' | 'chci-videt' | 'mozna' | null;
  timeFrom?: string;
  timeTo?: string;
}
