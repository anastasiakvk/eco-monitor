export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface StationsQuery {
  region?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface MeasurementsQuery {
  stationId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
