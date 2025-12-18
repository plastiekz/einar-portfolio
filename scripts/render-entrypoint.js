import { spawn } from 'child_process';

const PORT = process.env.PORT;
const IS_BUILD = process.argv.includes('--build') || process.env.npm_lifecycle_event === 'build';

if (IS_BUILD) {
  console.log('[Render Entrypoint] Build detected (via flag or npm lifecycle).');
  console.log('[Render Entrypoint] Building app via "vite build"...');

  const build = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });

  build.on('close', (code) => {
    if (code === 0) {
      console.log('[Render Entrypoint] Build completed successfully.');
    } else {
      console.error(`[Render Entrypoint] Build failed with code ${code}`);
    }
    process.exit(code);
  });
} else if (PORT) {
  console.log(`[Render Entrypoint] PORT detected (${PORT}). Assuming Runtime phase.`);
  console.log('[Render Entrypoint] Starting server via "npm run start"...');

  const server = spawn('npm', ['run', 'start'], { stdio: 'inherit', shell: true });

  server.on('close', (code) => {
    console.log(`[Render Entrypoint] Server exited with code ${code}`);
    process.exit(code);
  });
} else {
  // Fallback default behavior (likely local dev or build without flags)
  console.log('[Render Entrypoint] No PORT and no explicit build flag. Defaulting to build.');
  console.log('[Render Entrypoint] Building app via "vite build"...');

  const build = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });

  build.on('close', (code) => {
    if (code === 0) {
      console.log('[Render Entrypoint] Build completed successfully.');
    } else {
      console.error(`[Render Entrypoint] Build failed with code ${code}`);
    }
    process.exit(code);
  });
}
