export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  savedAt: string;
}

export interface User {
  id: string;
  email: string;
  parkedLocations: Location[];
}
