export class CreateTripDto {
  name: string;
  title?: string;
  emoji: string;
  dateFrom: string;
  dateTo: string;
  interests?: string[];
  useAi?: boolean;
  centerLat?: number;
  centerLng?: number;
}
