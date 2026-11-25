export interface University {
  id: string;
  name: string;
  location?: string;
  countryId?: string;
  partnerId?: string;
  coursesCount?: number;
  studyStreams?: string[];
  intakes?: string[];
  levels?: string[];
  lastSyncedAt?: string;
}
