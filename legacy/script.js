document.addEventListener('DOMContentLoaded', () => {
    /**
     * PRECISION STATE MANAGEMENT
     */
    let state = {
        isConnected: false,
        device: null,
        txCharacteristic: null,
        commands: JSON.parse(localStorage.getItem('nexus_commands')) || {
            'pad-up': 'up',
            'pad-down': 'down',
            'pad-left': 'left',
            'pad-right': 'right',
            'btn-a': 'horn',
            'btn-b': 'b'
        }
    };

    /**
     * SELECTORS
     */
    const elements = {
        connectBtn: document.getElementById('connect-btn'),
        settingsToggle: document.getElementById('settings-toggle'),
        sidebar: document.getElementById('sidebar'),
        sidebarClose: document.getElementById('sidebar-close'),
        cmdList: document.getElementById('cmd-list'),
        codeBuffer: document.getElementById('code-buffer'),
        codeDisplay: document.getElementById('code-display'),
        codePreviewArea: document.getElementById('code-preview-area'),
        toggleCodeBtn: document.getElementById('toggle-code'),
        directSyncBtn: document.getElementById('direct-sync'),
        downloadBtn: document.getElementById('download-firmware'),
        padBtns: document.querySelectorAll('.btn-pad[data-cmd]'),
        actionBtns: document.querySelectorAll('.btn-action'),
        sliders: document.querySelectorAll('input[type="range"]'),
        connectionDot: document.getElementById('connection-dot')
    };

    /**
     * CORE BLUETOOTH ENGINE
     */
    const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const UART_TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

    const connect = async () => {
        try {
            elements.connectBtn.textContent = 'Searching...';
            elements.connectBtn.style.opacity = '0.7';

            state.device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'BBC micro:bit' }],
                optionalServices: [UART_SERVICE_UUID]
            });

            const server = await state.device.gatt.connect();
            const service = await server.getPrimaryService(UART_SERVICE_UUID);
            state.txCharacteristic = await service.getCharacteristic(UART_TX_CHARACTERISTIC_UUID);

            state.isConnected = true;
            updateUI();

            state.device.addEventListener('gattserverdisconnected', onDisconnected);
            vibrate([20, 10, 20]); // Precise haptic pulse
        } catch (err) {
            console.error('Connection Error:', err);
            onDisconnected();
        }
    };

    const disconnect = () => {
        if (state.device?.gatt.connected) state.device.gatt.disconnect();
    };

    const onDisconnected = () => {
        state.isConnected = false;
        state.device = null;
        state.txCharacteristic = null;
        updateUI();
        vibrate(40);
    };

    const sendCmd = async (msg) => {
        if (!state.txCharacteristic) return;
        try {
            const encoder = new TextEncoder();
            await state.txCharacteristic.writeValue(encoder.encode(msg + '\n'));
        } catch (err) {
            console.warn('TX Blocked:', err);
        }
    };

    /**
     * UI SYNC
     */
    const updateUI = () => {
        const { isConnected } = state;
        const { connectBtn, connectionDot } = elements;

        if (isConnected) {
            connectBtn.textContent = 'Live Connected';
            connectBtn.classList.add('online');
            connectBtn.style.opacity = '1';
            connectionDot.style.background = '#34c759';
            connectionDot.style.boxShadow = '0 0 8px rgba(52, 199, 89, 0.4)';
        } else {
            connectBtn.textContent = 'Connect Device';
            connectBtn.classList.remove('online');
            connectBtn.style.opacity = '1';
            connectionDot.style.background = '#ff3b30';
            connectionDot.style.boxShadow = '0 0 8px rgba(255, 59, 48, 0.4)';
        }
    };

    /**
     * FIRMWARE LOGIC GENERATOR
     */
    const generateFirmware = () => {
        const { commands } = state;
        const code = `let receivedString = ""
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    receivedString = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (receivedString == "${commands['pad-up']}") {
        pins.servoWritePin(AnalogPin.P0, 180)
        pins.servoWritePin(AnalogPin.P1, 0)
    }
    if (receivedString == "${commands['pad-down']}") {
        pins.servoWritePin(AnalogPin.P0, 0)
        pins.servoWritePin(AnalogPin.P1, 180)
    }
    if (receivedString == "${commands['pad-right']}") {
        pins.servoWritePin(AnalogPin.P0, 180)
        pins.servoWritePin(AnalogPin.P1, 180)
    }
    if (receivedString == "${commands['pad-left']}") {
        pins.servoWritePin(AnalogPin.P0, 0)
        pins.servoWritePin(AnalogPin.P1, 0)
    }
    if (receivedString == "stop") {
        pins.servoWritePin(AnalogPin.P0, 90)
        pins.servoWritePin(AnalogPin.P1, 90)
    }
})
bluetooth.startUartService()
basic.showIcon(IconNames.Square)`;
        elements.codeBuffer.value = code;
        if (elements.codeDisplay) elements.codeDisplay.textContent = code;
    };

    /**
     * EVENT HANDLERS
     */
    const vibrate = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

    const handlePress = (id) => {
        const cmd = state.commands[id];
        if (cmd) {
            sendCmd(cmd);
            document.getElementById(id)?.classList.add('active');
            vibrate(15); // Ultra-short haptic
        }
    };

    const handleRelease = (id) => {
        const el = document.getElementById(id);
        if (el?.classList.contains('active')) {
            sendCmd('stop');
            el.classList.remove('active');
        }
    };

    // Connection Toggle
    elements.connectBtn.addEventListener('click', () => state.isConnected ? disconnect() : connect());

    // Sidebar Control
    elements.settingsToggle.addEventListener('click', () => elements.sidebar.classList.add('show'));
    elements.sidebarClose.addEventListener('click', () => elements.sidebar.classList.remove('show'));

    // Controller Input (Mouse/Touch)
    [...elements.padBtns, ...elements.actionBtns].forEach(btn => {
        const start = (e) => { e.preventDefault(); handlePress(btn.id); };
        const end = (e) => { e.preventDefault(); handleRelease(btn.id); };

        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
        btn.addEventListener('touchstart', start, { passive: false });
        btn.addEventListener('touchend', end, { passive: false });
    });

    // Keyboard Bindings
    const keyMap = {
        'ArrowUp': 'pad-up', 'ArrowDown': 'pad-down',
        'ArrowLeft': 'pad-left', 'ArrowRight': 'pad-right',
        'a': 'btn-a', 'A': 'btn-a', 'b': 'btn-b', 'B': 'btn-b'
    };

    document.addEventListener('keydown', (e) => {
        if (!e.repeat && keyMap[e.key]) handlePress(keyMap[e.key]);
    });
    document.addEventListener('keyup', (e) => {
        if (keyMap[e.key]) handleRelease(keyMap[e.key]);
    });

    // Precision Sliders
    elements.sliders.forEach(slider => {
        const prefix = slider.id.split('-')[1];
        const display = document.getElementById(`val-${prefix}`);
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            display.textContent = val;
            sendCmd(`${prefix}${val}`);
        });
    });

    // Logic Preview
    elements.toggleCodeBtn.addEventListener('click', () => {
        const isHidden = elements.codePreviewArea.classList.toggle('hidden');
        elements.toggleCodeBtn.textContent = isHidden ? 'Preview Logic' : 'Hide Script';
    });

    // Copy Tool
    elements.copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(elements.codeBuffer.value);
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = 'Script Copied';
        setTimeout(() => elements.copyBtn.textContent = originalText, 2000);
    });

    // Direct Sync Logic
    elements.directSyncBtn?.addEventListener('click', () => {
        const frame = document.getElementById('makecode-frame');
        if (!frame) return;

        const code = elements.codeBuffer.value;
        const project = {
            name: "Nexus Robot",
            target: "microbit",
            mainPath: "main.ts",
            files: {
                "main.ts": code
            }
        };

        frame.contentWindow.postMessage({
            type: "importproject",
            project: project
        }, "*");

        const originalText = elements.directSyncBtn.textContent;
        elements.directSyncBtn.textContent = 'Syncing...';
        setTimeout(() => elements.directSyncBtn.textContent = 'Logic Synced ✓', 1500);
        setTimeout(() => elements.directSyncBtn.textContent = originalText, 3000);
    });

    // Download Tool
    elements.downloadBtn?.addEventListener('click', () => {
        const code = elements.codeBuffer.value;
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus_robot_logic.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Intialize
    generateFirmware();
});
