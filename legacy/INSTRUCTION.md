# Nexus Control: Next-Gen Robotics Interface 🤖
## Technical Manual & Implementation Theory

Nexus Control is a high-precision, web-based robotics dashboard designed for the BBC micro:bit ecosystem. It leverages **Web Bluetooth (Web-BLE)** to provide real-time, low-latency control over mobile robotic platforms using a standard web browser.

---

## 1. Theoretical Foundation

### A. Web Bluetooth Communication (UART over BLE)
The core of Nexus Control is the **Nordic UART Service (NUS)**. Bluetooth Low Energy (BLE) is used not for high-speed data transfer, but for intermittent "packets" of control signals.
- **Service UUID**: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- **TX Characteristic**: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`

When a button is pressed on the dashboard, a string command (e.g., `"up"`) is UTF-8 encoded and sent as a byte array to the micro:bit. The micro:bit listens for these strings and executes corresponding motor logic.

### B. Continuous Rotation Servo Theory
Unlike standard servos that move to a specific angle (0-180°), **Continuous Rotation Servos** use the angle value to control *speed and direction*:
- **180°**: Full speed forward.
- **0°**: Full speed backward.
- **90°**: Neutral (Stop).

Nexus Control uses these values to calculate differential drive logic for your robot.

---

## 2. Hardware Setup & Pin Mapping

To use Nexus Control efficiently, your micro:bit should be wired as follows:

| Component | Micro:bit Pin | Control Signal Range |
|-----------|---------------|----------------------|
| **Left Motor** | P0 (Servo) | 0 (Rev) | 90 (Stop) | 180 (Fwd) |
| **Right Motor**| P1 (Servo) | 0 (Rev) | 90 (Stop) | 180 (Fwd) |
| **Expansion C**| P2 (Servo) | 0 - 180 Degrees |
| **Expansion X**| P8 (Servo) | 0 - 180 Degrees |

### Directional Logic Table:
- **↑ UP**: P0=180, P1=0 (Forward)
- **↓ DOWN**: P0=0, P1=180 (Reverse)
- **→ RIGHT**: P0=180, P1=180 (Pivot Right)
- **← LEFT**: P0=0, P1=0 (Pivot Left)
- **● STOP**: P0=90, P1=90

---

## 3. Operational Workflow

### Step 1: Initial Preparation
Ensure you are using a browser that supports Web Bluetooth:
- **Google Chrome** (Desktop & Android)
- **Microsoft Edge**
- **Bluefy** (iOS)

### Step 2: Code Synchonization
1. Open the **Nexus Control** dashboard.
2. Click the **Direct Sync** button in the MakeCode workspace at the bottom.
3. This pushes the custom control logic into the embedded editor.
4. Inside the MakeCode editor, click **Download** to flash the `.hex` file to your micro:bit.

### Step 3: Wireless Pairing
1. Power your micro:bit with a battery pack.
2. Click **Connect Device** on the Nexus Dashboard.
3. Select your micro:bit (e.g., `BBC micro:bit [vepiz]`) from the popup list.
4. The status indicator will turn **Green** when the link is established.

---

## 4. Troubleshooting

- **"No Bluetooth Devices Found"**: Ensure the micro:bit is in pairing mode and has the "Bluetooth UART" service enabled in the code.
- **Robot Moves Wrong Way**: In the **Settings (⚙️)** menu, you can swap the string commands (e.g., change "up" to "down") to manually invert the motor logic without rewriting the firmware.
- **Iframe Not Loading**: Ensure your internet connection is active, as the MakeCode editor is loaded directly from Microsoft's servers.

---
*Developed for the Nexus Robotics Ecosystem. Optimized for speed, precision, and reliable educational logic.*
