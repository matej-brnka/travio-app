export class UpdateTripDto {
  name?: string;
  title?: string;
  emoji?: string;
  dateFrom?: string;
  dateTo?: string;
  interests?: string[];
  centerLat?: number;
  centerLng?: number;
}
