declare namespace Express {
  import { Role } from '@prisma/client';

  export interface Request {
    user: {
      sub: number;
      roles: Role[];
    };
  }
}
