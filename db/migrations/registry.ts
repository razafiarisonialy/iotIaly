import type { Migration } from './runner';
import { v1 } from './v1_schema_and_defaults';
import { v2 } from './v2_indexes';

export const MIGRATIONS: Migration[] = [v1, v2];
