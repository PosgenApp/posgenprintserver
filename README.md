# Local Print Service (WebSocket)

A free, open-source alternative to QZ Tray for local network printing via WebSocket.

## Features

- ✅ WebSocket-based communication
- ✅ TCP/IP printer support (network printers)
- ✅ ESC/POS command support
- ✅ Free and open-source
- ✅ Lightweight and fast

## Installation

1. Install Node.js (v18+) or Bun on a computer/server on the same network as your printer
2. Install dependencies:
   ```bash
   npm install
   # or with Bun:
   bun install
   ```
3. (Optional) Configure `config.json`:
   ```json
   {
     "port": 8181,
     "defaultPrinterIp": "192.168.1.100",
     "defaultPrinterPort": 9100
   }
   ```
4. Start the service:
   ```bash
   # With Node.js:
   npm start
   # or
   node index.js
   
   # With Bun:
   bun run index.js
   # or
   npm run start:bun
   ```

**Note:** This service runs on Node.js/Bun runtime, not in a browser. There's no need to build it - just run it directly.

## Usage

The service runs a WebSocket server on port 8181 (default). Your web application connects to `ws://localhost:8181` to send print jobs.

## Creating an Installer

### Windows Installer (Inno Setup)

1. **Install Inno Setup:**
   - Download from https://innosetup.com/
   - Install it (default location: `C:\Program Files (x86)\Inno Setup 6\`)

2. **Build the executable:**
   ```bash
   bun build index.js --compile --outfile posgenprintservice.exe
   ```

3. **Build the installer:**
   ```powershell
   .\build-installer.ps1
   ```
   
   Or manually:
   - Open `installer.iss` in Inno Setup Compiler
   - Click "Build" → "Compile"

4. **The installer will be created in:**
   - `dist\PosgenPrintService-Setup.exe`

### Installing as Windows Service

**Option 1: Using NSSM (Recommended)**

1. **Download NSSM:**
   - https://nssm.cc/download
   - Extract to `C:\Program Files\nssm\`

2. **Run the install script:**
   ```powershell
   .\install-service.ps1
   ```

3. **To uninstall:**
   ```powershell
   .\uninstall-service.ps1
   ```

**Option 2: Manual Installation**

```powershell
# Install service
C:\Program Files\nssm\nssm.exe install PosgenPrintService "C:\path\to\posgenprintservice.exe"
C:\Program Files\nssm\nssm.exe set PosgenPrintService Start SERVICE_AUTO_START

# Start service
Start-Service PosgenPrintService
```

## Running as a Service

### Windows
- Use the provided `install-service.ps1` script with NSSM
- Or use `node-windows` or `pm2`

### Linux/macOS
Use systemd or pm2 to run as a service.

## Security

- The service should only be accessible from your local network
- Use a firewall to restrict access
- Consider adding authentication for production use

