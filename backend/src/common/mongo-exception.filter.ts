import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';
import { Error as MongooseError, mongo } from 'mongoose';

type MongoError = mongo.MongoServerError | MongooseError.CastError | MongooseError.ValidationError;

/**
 * Turns database errors caused by bad input into proper 4xx responses (same shape as Nest's
 * built-in errors). Anything else falls through to the default handler as a 500.
 */
@Catch(mongo.MongoServerError, MongooseError.CastError, MongooseError.ValidationError)
export class MongoExceptionFilter extends BaseExceptionFilter {
  override catch(exception: MongoError, host: ArgumentsHost): void {
    if (exception instanceof MongooseError.ValidationError) {
      const messages = Object.values(exception.errors).map((error) => error.message);
      return this.reply(host, HttpStatus.BAD_REQUEST, messages, 'Bad Request');
    }
    if (exception instanceof MongooseError.CastError) {
      return this.reply(
        host,
        HttpStatus.BAD_REQUEST,
        `Invalid value for ${exception.path}`,
        'Bad Request',
      );
    }
    if (exception.code === 11000) {
      const fields = Object.keys((exception.keyValue as Record<string, unknown> | undefined) ?? {});
      const what = fields.length > 0 ? fields.join(', ') : 'value';
      return this.reply(host, HttpStatus.CONFLICT, `That ${what} is already taken`, 'Conflict');
    }
    super.catch(exception, host);
  }

  private reply(
    host: ArgumentsHost,
    statusCode: number,
    message: string | string[],
    error: string,
  ) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .json({ statusCode, message, error });
  }
}
