const { spawn } = require('child_process');
const { URL } = require('url');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true, stdio: 'inherit', ...options });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  const fetchUrl = new URL(url);

  while (Date.now() < deadline) {
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        return;
      }
    } catch (_err) {
      // ignore until server is available
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function killProcess(proc) {
  if (!proc || proc.killed) return;
  try {
    proc.kill();
  } catch (err) {
    // ignore
  }
}

async function main() {
  const backendProcess = spawn('npm', ['--prefix', 'converter-backend', 'start'], {
    shell: true,
    stdio: 'inherit',
  });

  const backendExitPromise = new Promise((resolve, reject) => {
    backendProcess.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Backend process exited early with code ${code} signal ${signal}`));
      }
    });
    backendProcess.on('error', (err) => reject(err));
  });

  function cleanup() {
    killProcess(backendProcess);
  }

  process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(1);
  });

  try {
    await Promise.race([
      waitForServer('http://localhost:4000/api/health', 20000),
      backendExitPromise,
    ]);
    await run('npm', ['--prefix', 'converter-backend', 'run', 'cy:run']);
    await run('npm', ['--prefix', 'converter-frontend', 'run', 'cy:run']);
  } finally {
    cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
