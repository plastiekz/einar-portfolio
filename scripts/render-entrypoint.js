import { spawn } from 'child_process';

const PORT = process.env.PORT;
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

if (PORT) {
  console.log(`[Render Entrypoint] PORT detected (${PORT}). Assuming Runtime phase.`);
  console.log('[Render Entrypoint] Starting server via "npm run start"...');

  activeChild = spawn('npm', ['run', 'start'], { stdio: 'inherit', shell: true });

  activeChild.on('close', (code) => {
    console.log(`[Render Entrypoint] Server exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.log('[Render Entrypoint] No PORT detected. Assuming Build phase.');
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
