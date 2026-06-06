import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';
export const Ownership = (resource: string) => SetMetadata(OWNERSHIP_KEY, resource);
