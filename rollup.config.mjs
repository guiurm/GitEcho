import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/main.ts',
        output: {
            dir: 'dist/',
            format: 'esm',
            entryFileNames: 'main.js',
        },
        plugins: [typescript({ tsconfig: './tsconfig-esm.json' })],
    },
    {
        input: 'dist/main.js',
        output: {
            dir: 'dist/',
            format: 'cjs',
            entryFileNames: 'main.cjs',
        },
    },
    {
        input: 'src/bin/read-me-revamp.ts',
        output: {
            dir: 'dist/bin/',
            format: 'cjs',
            entryFileNames: 'read-me-revamp.cjs',
        },
        plugins: [typescript({ tsconfig: './tsconfig-bin.json' })],
    },
];
