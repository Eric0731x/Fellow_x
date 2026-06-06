import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorCode, ERROR_HTTP_STATUS } from '@fellowx/shared';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let code: string;
    let message: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      code = (resp.code as string) || this.mapStatusToCode(status);
      message = (resp.message as string) || exception.message;
    } else {
      code = this.mapStatusToCode(status);
      message = exception.message;
    }

    response.status(status).json({ code, message });
  }

  private mapStatusToCode(status: number): string {
    const statusMap: Record<number, ApiErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ApiErrorCode.VALIDATION,
      [HttpStatus.UNAUTHORIZED]: ApiErrorCode.TOKEN_INVALID,
      [HttpStatus.FORBIDDEN]: ApiErrorCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ApiErrorCode.NOT_FOUND,
      [HttpStatus.CONFLICT]: ApiErrorCode.INVALID_STATE_TRANSITION,
      [HttpStatus.TOO_MANY_REQUESTS]: ApiErrorCode.RATE_LIMITED,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ApiErrorCode.INTERNAL,
    };
    return statusMap[status] || ApiErrorCode.INTERNAL;
  }
}
