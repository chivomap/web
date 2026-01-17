export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  GEOJSON = 'GEOJSON',
  MAP = 'MAP',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly userMessage: string;

  constructor(
    type: ErrorType,
    code: string,
    message: string,
    userMessage: string = 'Ha ocurrido un error inesperado'
  ) {
    super(message);
    this.type = type;
    this.code = code;
    this.userMessage = userMessage;
    this.name = 'AppError';
  }
}

export const createNetworkError = (message: string, code = 'NETWORK_ERROR') =>
  new AppError(ErrorType.NETWORK, code, message, 'Error de conexión. Verifica tu internet.');

export const createTimeoutError = (message: string, code = 'TIMEOUT_ERROR') =>
  new AppError(ErrorType.TIMEOUT, code, message, 'La operación tardó demasiado. Intenta de nuevo.');

export const createValidationError = (message: string, code = 'VALIDATION_ERROR') =>
  new AppError(ErrorType.VALIDATION, code, message, 'Los datos proporcionados no son válidos.');

export const createGeoJsonError = (message: string, code = 'GEOJSON_ERROR') =>
  new AppError(ErrorType.GEOJSON, code, message, 'Error procesando datos geográficos.');
