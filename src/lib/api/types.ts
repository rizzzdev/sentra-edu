/**
 * Standard API Response Envelope
 * All service methods MUST return this shape.
 */

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalData: number;
  dataPerPage: number;
};

export type ApiResponse<T = null> = {
  error: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: Pagination;
};

/** Helper to create a success response */
export function successResponse<T>(data: T, message: string, statusCode: number = 200, pagination?: Pagination): ApiResponse<T> {
  return { error: false, statusCode, message, data, pagination };
}

/** Helper to create an error response — returns ApiResponse<any> so it can be returned from any service method */
export function errorResponse(message: string, statusCode: number = 400): ApiResponse<any> {
  return { error: true, statusCode, message, data: null };
}

/** Calculate pagination metadata */
export function calculatePagination(totalData: number, currentPage: number, dataPerPage: number): Pagination {
  return {
    currentPage,
    totalPages: Math.max(1, Math.ceil(totalData / dataPerPage)),
    totalData,
    dataPerPage
  };
}
