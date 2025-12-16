import { spawn } from 'child_process';

const PORT = process.env.PORT;

if (PORT) {
  console.log(`[Render Entrypoint] PORT detected (${PORT}). Assuming Runtime phase.`);
  console.log('[Render Entrypoint] Starting server via "npm run start"...');

  const server = spawn('npm', ['run', 'start'], { stdio: 'inherit', shell: true });

  server.on('close', (code) => {
    console.log(`[Render Entrypoint] Server exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.log('[Render Entrypoint] No PORT detected. Assuming Build phase.');
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
