export class UpdateTripDto {
  name?: string;
  title?: string;
  emoji?: string;
  dateFrom?: string;
  dateTo?: string;
  interests?: string[];
  centerLat?: number;
  centerLng?: number;
  destinations?: { name: string; lat: number | null; lng: number | null; viewportNorth?: number | null; viewportSouth?: number | null; viewportEast?: number | null; viewportWest?: number | null }[];
}
