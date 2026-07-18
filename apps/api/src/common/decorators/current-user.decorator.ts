import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@solo-advertiser/types';

/**
 * Extracts the current authenticated user from the request.
 * Usage: @CurrentUser() user: JwtPayload
 * Usage: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
