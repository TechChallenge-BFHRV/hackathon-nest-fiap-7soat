import { SetMetadata } from '@nestjs/common';

// Define a "roles" metadata key
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);