import { spawn } from 'child_process';

const PORT = process.env.PORT;
const IS_BUILD = process.env.npm_lifecycle_event === 'build';
let activeChild = null;

const handleSignal = (signal) => {
  console.log(`[Render Entrypoint] Received ${signal}. Shutting down...`);
  if (activeChild) {
    activeChild.kill(signal);
  }
  process.exit(0);
};

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));

// Priority: Check if explicitly running via 'npm run build'
if (IS_BUILD) {
  console.log('[Render Entrypoint] Detected "npm run build". Forcing Build phase.');
  console.log('[Render Entrypoint] Building app via "vite build"...');

  activeChild = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });

  activeChild.on('close', (code) => {
    if (code === 0) {
      console.log('[Render Entrypoint] Build completed successfully.');
    } else {
      console.error(`[Render Entrypoint] Build failed with code ${code}`);
    }
    process.exit(code);
  });
}
// Fallback: If not explicitly build, check for PORT to assume runtime
else if (PORT) {
  console.log(`[Render Entrypoint] PORT detected (${PORT}) and not in build event. Assuming Runtime phase.`);
  console.log('[Render Entrypoint] Starting server via "npm run start"...');

  activeChild = spawn('npm', ['run', 'start'], { stdio: 'inherit', shell: true });

  activeChild.on('close', (code) => {
    console.log(`[Render Entrypoint] Server exited with code ${code}`);
    process.exit(code);
  });
}
// Fallback: No PORT and not explicit build -> assume build (e.g. manual node execution)
else {
  console.log('[Render Entrypoint] No PORT and not explicit build. Defaulting to Build phase.');
  console.log('[Render Entrypoint] Building app via "vite build"...');

  activeChild = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });

  activeChild.on('close', (code) => {
    if (code === 0) {
      console.log('[Render Entrypoint] Build completed successfully.');
    } else {
      console.error(`[Render Entrypoint] Build failed with code ${code}`);
    }
    process.exit(code);
  });
}
