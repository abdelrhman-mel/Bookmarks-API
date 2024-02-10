import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user = request.user; // Get the user object from the request

    // Check if user is defined before accessing its properties
    if (user) {
      if (data) {
        return user[data];
      }
      return user;
    }

    // If user is undefined, return null or throw an error as appropriate
    return null; // Or you can throw an error here
  },
);
