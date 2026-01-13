/**
 * Build System
 * Generates client-side JavaScript bundle using Bun.build
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENTRY_POINT = path.join(__dirname, 'client.tsx');
const OUT_DIR = path.join(__dirname, '..', 'dist');

/**
 * Build options
 */
interface BuildOptions {
  minify?: boolean;
  sourcemap?: boolean;
  watch?: boolean;
}

/**
 * Build the client bundle
 */
export async function buildClient(options: BuildOptions = {}): Promise<void> {
  const { minify = false, sourcemap = true, watch = false } = options;

  console.log('[Build] Starting client build...');

  const buildConfig = {
    entrypoints: [ENTRY_POINT],
    outdir: OUT_DIR,
    target: 'browser' as const,
    format: 'esm' as const,
    minify,
    sourcemap: sourcemap ? ('external' as const) : false,
    naming: {
      entry: '[name].js',
      chunk: '[name]-[hash].[ext]',
    },
    // Don't externalize React - bundle it for the browser
    external: [],
    // Define constants
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  };

  try {
    const result = await Bun.build(buildConfig);

    if (!result.success) {
      console.error('[Build] Build failed:');
      for (const log of result.logs) {
        console.error(`  ${log.message}`);
      }
      throw new Error('Build failed');
    }

    console.log(`[Build] Built ${result.outputs.length} files:`);
    for (const output of result.outputs) {
      console.log(`  ${path.relative(path.join(__dirname, '..'), output.path)}: ${output.size} bytes`);
    }

    if (watch) {
      console.log('[Build] Watch mode enabled (press Ctrl+C to stop)');
      await watchAndRebuild(buildConfig);
    }
  } catch (error) {
    console.error('[Build] Error during build:', error);
    throw error;
  }
}

/**
 * Watch mode for development
 */
async function watchAndRebuild(config: any): Promise<void> {
  const watcher = process.stdin;
  console.log('[Build] Press "r" + Enter to rebuild, Ctrl+C to exit');

  // Simple rebuild on 'r' key
  watcher.setRawMode(true);
  watcher.on('data', async (data) => {
    const char = data.toString().trim();
    if (char === 'r') {
      console.log('[Build] Rebuilding...');
      try {
        const result = await Bun.build(config);
        if (result.success) {
          console.log(`[Build] Rebuilt ${result.outputs.length} files`);
        } else {
          console.error('[Build] Rebuild failed');
        }
      } catch (e) {
        console.error('[Build] Error:', e);
      }
    }
  });
}

/**
 * CLI entry point
 */
if (import.meta.path === Bun.resolveSync('./build.ts', import.meta.dir)) {
  const args = process.argv.slice(2);
  const options: BuildOptions = {
    minify: args.includes('--minify'),
    sourcemap: !args.includes('--no-sourcemap'),
    watch: args.includes('--watch'),
  };

  await buildClient(options);
}
