export class CreateTripDto {
  name: string;
  emoji: string;
  dateFrom: string;
  dateTo: string;
  interests?: string[];
  useAi?: boolean;
}
