import * as migration_20250714_033333 from './20250714_033333';

export const migrations = [
  {
    up: migration_20250714_033333.up,
    down: migration_20250714_033333.down,
    name: '20250714_033333'
  },
];
