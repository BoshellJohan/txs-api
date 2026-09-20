import { spawnSync } from 'node:child_process';

const build = spawnSync(
    'artillery',
    ['run', './tests/api-load.yml'],
    {
        stdio: 'inherit',
        shell: true,
    },
);

const cleanup = spawnSync(
    'npm',
    ['run', 'cleanup:test-users'],
    {
        stdio: 'inherit',
        shell: true,
    },
);

process.exit(build.status ?? 1);
