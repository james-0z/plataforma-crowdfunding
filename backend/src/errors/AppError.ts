/** Error esperado de la aplicación: se traduce a una respuesta HTTP limpia. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = 'ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'No autenticado.') {
    return new AppError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'No tienes permiso para esta acción.') {
    return new AppError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Recurso no encontrado.') {
    return new AppError(404, message, 'NOT_FOUND');
  }
  static conflict(message: string) {
    return new AppError(409, message, 'CONFLICT');
  }
}
