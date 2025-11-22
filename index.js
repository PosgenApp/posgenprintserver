import { WebSocketServer } from 'ws';
import { createConnection } from 'net';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { cwd } from 'process';

// Get directory - handle both regular execution and compiled executable
let configDir;
try {
  const __filename = fileURLToPath(import.meta.url);
  configDir = dirname(__filename);
} catch (err) {
  // If fileURLToPath fails (e.g., in compiled executable), try to get executable directory
  try {
    // Try to get directory from executable path
    const execPath = process.execPath || process.argv[0];
    configDir = dirname(execPath);
  } catch {
    // Fallback to current working directory
    configDir = cwd();
  }
}

// Load configuration
let config = {
  port: process.env.PRINT_SERVICE_PORT || 8181,
  defaultPrinterIp: process.env.DEFAULT_PRINTER_IP,
  defaultPrinterPort: parseInt(process.env.DEFAULT_PRINTER_PORT || '9100'),
};

// Try multiple locations for config.json
const configPaths = [
  join(configDir, 'config.json'),           // Same directory as executable/script
  join(cwd(), 'config.json'),               // Current working directory
  join(process.cwd(), 'config.json'),       // Process working directory
];

let configLoaded = false;
for (const configPath of configPaths) {
  try {
    if (existsSync(configPath)) {
      const configFile = readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configFile);
      config = { ...config, ...parsedConfig };
      configLoaded = true;
      console.log(`✅ Loaded config from: ${configPath}`);
      break;
    }
  } catch (err) {
    // Try next path
    continue;
  }
}

if (!configLoaded) {
  console.log('⚠️  No config.json found, using environment variables or defaults');
  console.log('📁 Tried paths:');
  configPaths.forEach(path => {
    const exists = existsSync(path);
    console.log(`   ${exists ? '✅' : '❌'} ${path}`);
  });
  console.log(`📂 Current working directory: ${cwd()}`);
  console.log(`📂 Executable directory: ${configDir}`);
}

// Create WebSocket server
const wss = new WebSocketServer({ port: config.port });

console.log(`🚀 Local Print Service (WebSocket) running on port ${config.port}`);
console.log(`📡 Ready to receive print jobs via WebSocket`);

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'ping') {
        // Heartbeat
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (data.type === 'print') {
        const { printerIp, printerPort, printData } = data;
        
        const ip = printerIp || config.defaultPrinterIp;
        const port = printerPort || config.defaultPrinterPort;

        if (!ip) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Printer IP is required',
          }));
          return;
        }

        // Validate IP format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid IP address format',
          }));
          return;
        }

        // Decode base64 data
        const buffer = Buffer.from(printData, 'base64');

        console.log(`[PRINT] Connecting to printer ${ip}:${port}`);
        console.log(`[PRINT] Data length: ${buffer.length} bytes`);

        // Connect to printer via TCP/IP
        try {
          await new Promise((resolve, reject) => {
            const socket = createConnection(port, ip, () => {
              console.log(`[PRINT] Connected to printer ${ip}:${port}`);
              
              // Write data
              socket.write(buffer, (err) => {
                if (err) {
                  console.error(`[PRINT] Write error:`, err);
                  socket.destroy();
                  reject(err);
                  return;
                }
                
                console.log(`[PRINT] Data written successfully`);
                
                // Wait a bit before closing
                setTimeout(() => {
                  socket.end();
                  resolve();
                }, 500);
              });
            });

            socket.on('error', (err) => {
              console.error(`[PRINT] Connection error:`, err);
              reject(err);
            });

            socket.on('close', () => {
              console.log(`[PRINT] Connection closed`);
            });

            // Timeout
            socket.setTimeout(10000);
            socket.on('timeout', () => {
              console.error(`[PRINT] Connection timeout`);
              socket.destroy();
              reject(new Error('Connection timeout'));
            });
          });

          ws.send(JSON.stringify({
            type: 'success',
            message: 'Print successful',
          }));
        } catch (printError) {
          console.error('[PRINT] Error:', printError);
          ws.send(JSON.stringify({
            type: 'error',
            message: printError.message || 'Failed to print',
          }));
        }
      } else if (data.type === 'getPrinters') {
        // For now, return empty array - can be extended to detect system printers
        ws.send(JSON.stringify({
          type: 'printers',
          printers: [],
        }));
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message || 'Invalid message format',
      }));
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('[WS] Error:', error);
  });

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Local Print Service',
  }));
});

// Handle server errors
wss.on('error', (error) => {
  console.error('[SERVER] Error:', error);
});

console.log(`✅ WebSocket server ready at ws://localhost:${config.port}`);

