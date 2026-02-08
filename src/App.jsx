import { useState, useEffect, useCallback, useRef } from 'react';

function App() {
    // Core State
    const [isConnected, setIsConnected] = useState(false);
    const [device, setDevice] = useState(null);
    const [txCharacteristic, setTxCharacteristic] = useState(null);
    const [commands, setCommands] = useState(() => {
        return JSON.parse(localStorage.getItem('nexus_commands')) || {
            'pad-up': 'up', 'pad-down': 'down', 'pad-left': 'left', 'pad-right': 'right',
            'btn-a': 'horn', 'btn-b': 'b'
        };
    });

    // UI State
    const [sliderVals, setSliderVals] = useState({ c: 90, x: 90 });
    const [showSidebar, setShowSidebar] = useState(false);
    const [showCodePreview, setShowCodePreview] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [activeMode, setActiveMode] = useState('classic'); // classic, voice, gesture, joystick, record, mission

    // Voice Control State
    const [voiceActive, setVoiceActive] = useState(false);
    const [lastVoiceCommand, setLastVoiceCommand] = useState('');
    const recognitionRef = useRef(null);

    // Gesture Control State
    const [gestureActive, setGestureActive] = useState(false);
    const [tiltData, setTiltData] = useState({ beta: 0, gamma: 0 });

    // Record & Replay State
    const [recording, setRecording] = useState(false);
    const [recordedSequence, setRecordedSequence] = useState([]);
    const [savedSequences, setSavedSequences] = useState(() => {
        return JSON.parse(localStorage.getItem('nexus_sequences')) || [];
    });

    // Joystick State
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
    const joystickRef = useRef(null);
    const joystickDragging = useRef(false);

    // Telemetry State
    const [telemetry, setTelemetry] = useState({
        battery: 100, distance: 0, speed: 0, temperature: 22, light: 50
    });

    // Mission Planner State
    const [missionPath, setMissionPath] = useState([]);
    const [executingMission, setExecutingMission] = useState(false);

    const [firmwareCode, setFirmwareCode] = useState('');
    const [commandLog, setCommandLog] = useState([]);
    const logRef = useRef(null);

    const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const UART_RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    const UART_TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

    // Persistence
    useEffect(() => {
        localStorage.setItem('nexus_commands', JSON.stringify(commands));
    }, [commands]);

    useEffect(() => {
        localStorage.setItem('nexus_sequences', JSON.stringify(savedSequences));
    }, [savedSequences]);

    // Generate Firmware
    useEffect(() => {
        const code = `/**
 * Nexus Robot Control Firmware
 * 1. Add 'bluetooth' extension in MakeCode
 * 2. Set pairing to 'No Passkey' in Project Settings
 */
let receivedString = ""
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.Asleep)
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    receivedString = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    
    // Directional Control
    if (receivedString == "${commands['pad-up']}") {
        pins.servoWritePin(AnalogPin.P0, 180)
        pins.servoWritePin(AnalogPin.P1, 0)
    } else if (receivedString == "${commands['pad-down']}") {
        pins.servoWritePin(AnalogPin.P0, 0)
        pins.servoWritePin(AnalogPin.P1, 180)
    } else if (receivedString == "${commands['pad-right']}") {
        pins.servoWritePin(AnalogPin.P0, 180)
        pins.servoWritePin(AnalogPin.P1, 180)
    } else if (receivedString == "${commands['pad-left']}") {
        pins.servoWritePin(AnalogPin.P0, 0)
        pins.servoWritePin(AnalogPin.P1, 0)
    } else if (receivedString == "stop") {
        pins.servoWritePin(AnalogPin.P0, 90)
        pins.servoWritePin(AnalogPin.P1, 90)
    }
    
    // Servo Calibration (Example: c120, x45)
    if (receivedString.includes("c")) {
        let val = parseInt(receivedString.substr(1))
        pins.servoWritePin(AnalogPin.P2, val)
    }
})
bluetooth.startUartService()
basic.showString("READY")
basic.showIcon(IconNames.Happy)`;
        setFirmwareCode(code);
    }, [commands]);

    const vibrate = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

    const sendCmd = useCallback(async (msg) => {
        if (!device || !device.gatt.connected) return;

        try {
            // Re-acquire characteristic if lost but connected
            let char = txCharacteristic;
            if (!char) {
                const server = await device.gatt.connect();
                const service = await server.getPrimaryService(UART_SERVICE_UUID);
                char = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);
                setTxCharacteristic(char);
            }

            const encoder = new TextEncoder();
            await char.writeValue(encoder.encode(msg + '\n'));

            // Log for feedback
            const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setCommandLog(prev => [{ time: timestamp, msg }, ...prev].slice(0, 5));

            // Record if recording is active
            if (recording && msg !== 'stop') {
                setRecordedSequence(prev => [...prev, { cmd: msg, timestamp: Date.now() }]);
            }
        } catch (err) {
            console.warn('TX Blocked:', err);
            // If it's a connection error, reset connection state
            if (err.name === 'NetworkError') setIsConnected(false);
            setCommandLog(prev => [{ time: 'Error', msg: 'Delivery Failed' }, ...prev].slice(0, 5));
        }
    }, [device, txCharacteristic, recording]);

    // ===== VOICE CONTROL =====
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            setLastVoiceCommand(transcript);

            if (transcript.includes('forward') || transcript.includes('go')) sendCmd(commands['pad-up']);
            else if (transcript.includes('back') || transcript.includes('reverse')) sendCmd(commands['pad-down']);
            else if (transcript.includes('left')) sendCmd(commands['pad-left']);
            else if (transcript.includes('right')) sendCmd(commands['pad-right']);
            else if (transcript.includes('stop') || transcript.includes('halt')) sendCmd('stop');
            else if (transcript.includes('horn') || transcript.includes('beep')) sendCmd(commands['btn-a']);
        };

        recognitionRef.current = recognition;
    }, [sendCmd]);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert('Voice recognition not supported in this browser. Use Chrome.');
            return;
        }

        if (voiceActive) {
            recognitionRef.current.stop();
            setVoiceActive(false);
        } else {
            recognitionRef.current.start();
            setVoiceActive(true);
        }
    };

    // ===== GESTURE CONTROL =====
    useEffect(() => {
        if (!gestureActive) return;

        const handleOrientation = (event) => {
            const beta = event.beta || 0;  // Front-back tilt (-180 to 180)
            const gamma = event.gamma || 0; // Left-right tilt (-90 to 90)

            setTiltData({ beta, gamma });

            // Convert tilt to commands
            if (Math.abs(beta) > 15 || Math.abs(gamma) > 15) {
                if (beta < -20) sendCmd(commands['pad-up']);
                else if (beta > 20) sendCmd(commands['pad-down']);
                else if (gamma < -20) sendCmd(commands['pad-left']);
                else if (gamma > 20) sendCmd(commands['pad-right']);
                else sendCmd('stop');
            } else {
                sendCmd('stop');
            }
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                });
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [gestureActive, sendCmd]);

    // ===== JOYSTICK =====
    const handleJoystickMove = useCallback((clientX, clientY) => {
        if (!joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxRadius = centerX * 0.8;

        let x = clientX - rect.left - centerX;
        let y = clientY - rect.top - centerY;

        const distance = Math.sqrt(x * x + y * y);
        if (distance > maxRadius) {
            x = (x / distance) * maxRadius;
            y = (y / distance) * maxRadius;
        }

        setJoystickPos({ x, y });

        // Convert to robot commands
        const angle = Math.atan2(y, x) * (180 / Math.PI);
        const power = Math.min(distance / maxRadius, 1);

        if (power > 0.3) {
            if (angle > -45 && angle <= 45) sendCmd(commands['pad-right']);
            else if (angle > 45 && angle <= 135) sendCmd(commands['pad-down']);
            else if (angle > -135 && angle <= -45) sendCmd(commands['pad-up']);
            else sendCmd(commands['pad-left']);
        } else {
            sendCmd('stop');
        }
    }, [sendCmd]);

    const handleJoystickEnd = () => {
        joystickDragging.current = false;
        setJoystickPos({ x: 0, y: 0 });
        sendCmd('stop');
    };

    // ===== RECORD & REPLAY =====
    const startRecording = () => {
        setRecording(true);
        setRecordedSequence([]);
    };

    const stopRecording = () => {
        setRecording(false);
        if (recordedSequence.length > 0) {
            const name = prompt('Name this sequence:') || `Seq_${Date.now()}`;
            setSavedSequences(prev => [...prev, { name, sequence: recordedSequence }]);
        }
    };

    const playSequence = async (sequence) => {
        setExecutingMission(true);
        let lastTime = sequence[0].timestamp;

        for (const step of sequence) {
            const delay = step.timestamp - lastTime;
            await new Promise(resolve => setTimeout(resolve, delay));
            sendCmd(step.cmd);
            lastTime = step.timestamp;
        }

        sendCmd('stop');
        setExecutingMission(false);
    };

    // ===== MISSION PLANNER =====
    const addMissionPoint = (x, y) => {
        setMissionPath(prev => [...prev, { x, y }]);
    };

    const executeMission = async () => {
        if (missionPath.length < 2) return;
        setExecutingMission(true);

        for (let i = 0; i < missionPath.length - 1; i++) {
            const current = missionPath[i];
            const next = missionPath[i + 1];

            // Calculate direction
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Determine command
            let cmd = commands['pad-up'];
            if (angle > -45 && angle <= 45) cmd = commands['pad-right'];
            else if (angle > 45 && angle <= 135) cmd = commands['pad-down'];
            else if (angle > -135 && angle <= -45) cmd = commands['pad-up'];
            else cmd = commands['pad-left'];

            sendCmd(cmd);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        sendCmd('stop');
        setExecutingMission(false);
    };

    // Classic Controls
    const handlePress = useCallback((id) => {
        const cmd = commands[id];
        if (cmd) {
            sendCmd(cmd);
            setActiveButton(id);
            vibrate(15);
        }
    }, [commands, sendCmd]);

    const handleRelease = useCallback((id) => {
        if (activeButton === id) {
            sendCmd('stop');
            setActiveButton(null);
        }
    }, [activeButton, sendCmd]);

    // Bluetooth Connection
    const onDisconnected = useCallback(() => {
        setIsConnected(false);
        setDevice(null);
        setTxCharacteristic(null);
        vibrate(40);
    }, []);

    const connect = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'BBC micro:bit' }],
                optionalServices: [UART_SERVICE_UUID]
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(UART_SERVICE_UUID);

            // For Micro:bit, we write to the RX characteristic (device perspective)
            const rxChar = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

            setDevice(device);
            setTxCharacteristic(rxChar);
            setIsConnected(true);

            device.addEventListener('gattserverdisconnected', onDisconnected);
            vibrate([20, 10, 20]);
        } catch (err) {
            console.error('Connection Error:', err);
            onDisconnected();
        }
    };

    const disconnect = () => {
        if (device?.gatt.connected) device.gatt.disconnect();
    };

    // Keyboard Controls
    useEffect(() => {
        const keyMap = {
            'ArrowUp': 'pad-up', 'ArrowDown': 'pad-down',
            'ArrowLeft': 'pad-left', 'ArrowRight': 'pad-right',
            'a': 'btn-a', 'A': 'btn-a', 'b': 'btn-b', 'B': 'btn-b'
        };

        const handleKeyDown = (e) => {
            if (!e.repeat && keyMap[e.key] && activeMode === 'classic') handlePress(keyMap[e.key]);
        };
        const handleKeyUp = (e) => {
            if (keyMap[e.key] && activeMode === 'classic') handleRelease(keyMap[e.key]);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handlePress, handleRelease, activeMode]);

    const downloadCode = () => {
        const blob = new Blob([firmwareCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus_robot_logic.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const directSync = () => {
        const frame = document.getElementById('makecode-frame');
        if (!frame) return;

        const project = {
            name: "Nexus Robot",
            target: "microbit",
            mainPath: "main.ts",
            files: { "main.ts": firmwareCode }
        };

        frame.contentWindow.postMessage({ type: "importproject", project }, "*");

        // Show a more helpful message
        const confirmMsg = "Logic data sent to editor. \n\nIf you don't see the changes: \n1. Ensure the editor is loaded \n2. Or manually Copy-Paste the 'Preview' code into the editor.";
        alert(confirmMsg);
    };

    return (
        <div className="app-container">
            <header>
                <div className="brand">
                    <span className="brand-icon">🤖</span>
                    <h1>Nexus<span>Control</span> <span style={{ fontSize: '0.6rem', color: 'var(--accent-purple)', background: 'rgba(155, 81, 224, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>MICRO:BIT EDITION</span></h1>
                </div>
                <div className="nav-actions">
                    <button
                        onClick={isConnected ? disconnect : connect}
                        className={`btn-connect ${isConnected ? 'online' : ''}`}
                    >
                        <span className="label">{isConnected ? 'Live Connected' : 'Connect Device'}</span>
                    </button>
                    <button onClick={() => setShowSidebar(true)} className="icon-setting">⚙️</button>
                </div>
            </header>

            {/* Micro:bit Setup Guide */}
            <section className="panel" style={{ margin: '0 2rem', background: 'linear-gradient(135deg, #fff 0%, #f0f7ff 100%)', border: '1px solid #cce4ff' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem', fontSize: '0.9rem' }}>🚀 2-STEP MICRO:BIT SYNC</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Step 1: Flash Firmware</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click <b>Sync</b> in the editor below to load the controller logic into MakeCode, then download to your Micro:bit.</p>
                            </div>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Step 2: Connect Bluetooth</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Once the Micro:bit shows "READY", click <b>Connect Device</b> above. Ensure your Micro:bit has Bluetooth enabled.</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '200px', fontSize: '0.7rem', color: '#5b89ba', background: '#e1f0ff', padding: '1rem', borderRadius: '12px' }}>
                        <b>⚠️ IMPORTANT:</b> In MakeCode, go to Project Settings and set <b>"No Passkey Pairing"</b> for easier Web Bluetooth connection.
                    </div>
                </div>
            </section>

            {/* Live Connection & Log */}
            <section className="panel" style={{ margin: '0 2rem', padding: '1rem', background: '#1d1d1f', color: '#00ff41', fontFamily: 'monospace', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>📡 LIVE TRANSMISSION LOG</span>
                    <span style={{ fontSize: '0.6rem', color: isConnected ? '#00ff41' : '#ff3b30' }}>{isConnected ? '• CONNECTED' : '• OFFLINE'}</span>
                </div>
                <div style={{ height: '80px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {commandLog.length === 0 ? (
                        <div style={{ opacity: 0.3, fontSize: '0.75rem' }}>Waiting for connection & commands...</div>
                    ) : (
                        commandLog.map((log, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', display: 'flex', gap: '1rem', opacity: 1 - (i * 0.2) }}>
                                <span style={{ color: '#888' }}>[{log.time}]</span>
                                <span>{'>'} SENT: <b style={{ color: '#fff' }}>{log.msg}</b></span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                {[
                    { id: 'classic', label: '🎮 Classic', desc: 'Buttons & Keys' },
                    { id: 'voice', label: '🎙️ Voice', desc: 'Speak Commands' },
                    { id: 'gesture', label: '📱 Gesture', desc: 'Tilt Control' },
                    { id: 'joystick', label: '🕹️ Joystick', desc: '360° Control' },
                    { id: 'record', label: '⏺️ Record', desc: 'Save & Replay' },
                    { id: 'mission', label: '🎯 Mission', desc: 'Path Planner' }
                ].map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        style={{
                            flex: '1',
                            minWidth: '120px',
                            padding: '0.8rem',
                            background: activeMode === mode.id ? 'var(--accent-blue)' : '#f8f9fa',
                            color: activeMode === mode.id ? 'white' : 'var(--text-primary)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'var(--transition-fast)',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                        }}
                    >
                        <div>{mode.label}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.2rem' }}>{mode.desc}</div>
                    </button>
                ))}
            </div>

            <main className="dashboard">
                {/* CLASSIC MODE */}
                {activeMode === 'classic' && (
                    <div className="col-top">
                        <section className="panel gamepad">
                            <div className="panel-header">
                                <h3>Directional Control</h3>
                                <div className={`status-dot ${isConnected ? '' : 'red'}`} style={{ background: isConnected ? '#34c759' : '#ff3b30' }}></div>
                            </div>

                            <div className="gamepad-container">
                                <div className="d-pad">
                                    {['up', 'left', 'right', 'down'].map(dir => (
                                        <button
                                            key={dir}
                                            onMouseDown={() => handlePress(`pad-${dir}`)}
                                            onMouseUp={() => handleRelease(`pad-${dir}`)}
                                            onTouchStart={(e) => { e.preventDefault(); handlePress(`pad-${dir}`); }}
                                            onTouchEnd={(e) => { e.preventDefault(); handleRelease(`pad-${dir}`); }}
                                            className={`btn-pad ${dir} ${activeButton === `pad-${dir}` ? 'active' : ''}`}
                                        >
                                            {dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'}
                                        </button>
                                    ))}
                                    <button className="btn-pad center">○</button>
                                </div>

                                <div className="action-row">
                                    {['a', 'b'].map(btn => (
                                        <button
                                            key={btn}
                                            onMouseDown={() => handlePress(`btn-${btn}`)}
                                            onMouseUp={() => handleRelease(`btn-${btn}`)}
                                            onTouchStart={(e) => { e.preventDefault(); handlePress(`btn-${btn}`); }}
                                            onTouchEnd={(e) => { e.preventDefault(); handleRelease(`btn-${btn}`); }}
                                            className={`btn-action ${activeButton === `btn-${btn}` ? 'active' : ''}`}
                                        >
                                            {btn.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="panel precision">
                            <div className="panel-header"><h3>Servo Calibration</h3></div>
                            <div className="slider-stack">
                                {['c', 'x'].map(id => (
                                    <div key={id} className="slider-item">
                                        <div className="slider-info">
                                            <span>CHANNEL {id.toUpperCase()}</span>
                                            <span className="slider-value">{sliderVals[id]}</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="180"
                                            value={sliderVals[id]}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setSliderVals(prev => ({ ...prev, [id]: v }));
                                                sendCmd(`${id}${v}`);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* VOICE MODE */}
                {activeMode === 'voice' && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎙️</div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Voice Command Center</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Say: "Forward", "Back", "Left", "Right", "Stop", "Horn"
                        </p>

                        <button
                            onClick={toggleVoice}
                            style={{
                                padding: '1.5rem 3rem',
                                fontSize: '1.2rem',
                                background: voiceActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}
                        >
                            {voiceActive ? '🛑 Stop Listening' : '🎤 Start Voice Control'}
                        </button>

                        {voiceActive && (
                            <div style={{
                                padding: '1.5rem',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                display: 'inline-block',
                                animation: 'pulse 1.5s infinite'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Listening...</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                                    {lastVoiceCommand || 'Speak now'}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* GESTURE MODE */}
                {activeMode === 'gesture' && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>📱</div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Gesture Control</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Tilt your device to steer the robot
                        </p>

                        <button
                            onClick={() => setGestureActive(!gestureActive)}
                            style={{
                                padding: '1.5rem 3rem',
                                fontSize: '1.2rem',
                                background: gestureActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}
                        >
                            {gestureActive ? '🛑 Stop Gesture' : '🚀 Activate Tilt Control'}
                        </button>

                        {gestureActive && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                maxWidth: '400px',
                                margin: '0 auto'
                            }}>
                                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Forward/Back</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-blue)' }}>{tiltData.beta.toFixed(0)}°</div>
                                </div>
                                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Left/Right</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-purple)' }}>{tiltData.gamma.toFixed(0)}°</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* JOYSTICK MODE */}
                {activeMode === 'joystick' && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Virtual Joystick</h2>

                        <div
                            ref={joystickRef}
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                background: '#f8f9fa',
                                margin: '0 auto',
                                position: 'relative',
                                border: '2px solid var(--border-color)',
                                cursor: 'grab'
                            }}
                            onMouseDown={(e) => {
                                joystickDragging.current = true;
                                handleJoystickMove(e.clientX, e.clientY);
                            }}
                            onMouseMove={(e) => {
                                if (joystickDragging.current) handleJoystickMove(e.clientX, e.clientY);
                            }}
                            onMouseUp={handleJoystickEnd}
                            onMouseLeave={handleJoystickEnd}
                            onTouchStart={(e) => {
                                joystickDragging.current = true;
                                const touch = e.touches[0];
                                handleJoystickMove(touch.clientX, touch.clientY);
                            }}
                            onTouchMove={(e) => {
                                if (joystickDragging.current) {
                                    const touch = e.touches[0];
                                    handleJoystickMove(touch.clientX, touch.clientY);
                                }
                            }}
                            onTouchEnd={handleJoystickEnd}
                        >
                            <div style={{
                                position: 'absolute',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'var(--accent-blue)',
                                top: '50%',
                                left: '50%',
                                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
                                transition: joystickDragging.current ? 'none' : 'transform 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                )}

                {/* RECORD MODE */}
                {activeMode === 'record' && (
                    <div style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Record & Replay</h2>

                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <button
                                onClick={recording ? stopRecording : startRecording}
                                style={{
                                    padding: '1rem 2rem',
                                    fontSize: '1rem',
                                    background: recording ? 'var(--accent-red)' : 'var(--accent-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {recording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
                            </button>
                            {recording && (
                                <div style={{ marginTop: '1rem', color: 'var(--accent-red)', fontWeight: '700' }}>
                                    Recording... ({recordedSequence.length} commands)
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {savedSequences.map((seq, idx) => (
                                <div key={idx} style={{
                                    padding: '1.5rem',
                                    background: '#f8f9fa',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{seq.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        {seq.sequence.length} steps
                                    </div>
                                    <button
                                        onClick={() => playSequence(seq.sequence)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'var(--accent-blue)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ▶️ Play
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MISSION MODE */}
                {activeMode === 'mission' && (
                    <div style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Mission Planner</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Click on the grid to plan a path</p>

                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <button
                                onClick={executeMission}
                                disabled={missionPath.length < 2 || executingMission}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'var(--accent-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    marginRight: '1rem',
                                    opacity: missionPath.length < 2 ? 0.5 : 1
                                }}
                            >
                                🚀 Execute Mission
                            </button>
                            <button
                                onClick={() => setMissionPath([])}
                                style={{
                                    padding: '1rem 2rem',
                                    background: '#f8f9fa',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Clear
                            </button>
                        </div>

                        <svg
                            width="600"
                            height="400"
                            style={{
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                cursor: 'crosshair',
                                display: 'block',
                                margin: '0 auto'
                            }}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                addMissionPoint(x, y);
                            }}
                        >
                            {/* Grid */}
                            {[...Array(12)].map((_, i) => (
                                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#ddd" strokeWidth="1" />
                            ))}
                            {[...Array(8)].map((_, i) => (
                                <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="#ddd" strokeWidth="1" />
                            ))}

                            {/* Path */}
                            {missionPath.map((point, idx) => (
                                <g key={idx}>
                                    <circle cx={point.x} cy={point.y} r="8" fill="var(--accent-blue)" />
                                    {idx > 0 && (
                                        <line
                                            x1={missionPath[idx - 1].x}
                                            y1={missionPath[idx - 1].y}
                                            x2={point.x}
                                            y2={point.y}
                                            stroke="var(--accent-blue)"
                                            strokeWidth="3"
                                            markerEnd="url(#arrowhead)"
                                        />
                                    )}
                                </g>
                            ))}

                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                    <polygon points="0 0, 10 3, 0 6" fill="var(--accent-blue)" />
                                </marker>
                            </defs>
                        </svg>
                    </div>
                )}

                {/* MakeCode Editor - Always Visible */}
                <div className="col-bottom">
                    <section className="panel editor-panel">
                        <div className="editor-toolbar">
                            <div className="editor-title-group">
                                <span className="editor-subtitle">Logic Configuration</span>
                                <div className="editor-info"><strong>MakeCode Workspace</strong></div>
                            </div>
                            <div className="toolbar-btns">
                                <button onClick={() => setShowCodePreview(!showCodePreview)} className="btn-outline">
                                    {showCodePreview ? 'Hide' : 'Preview'}
                                </button>
                                <button onClick={directSync} className="btn-connect" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Sync</button>
                                <button onClick={downloadCode} className="copy-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #d2d2d7', color: 'var(--text-primary)' }}>📥 Save</button>
                            </div>
                        </div>

                        <div className="editor-workspace" style={{ height: '600px' }}>
                            {showCodePreview && (
                                <div className="code-preview">
                                    <div className="preview-header">Current Script:</div>
                                    <pre><code>{firmwareCode}</code></pre>
                                </div>
                            )}
                            <div className="iframe-box">
                                <iframe
                                    id="makecode-frame"
                                    src="https://makecode.microbit.org/#pub:_RsCVsEF3M0Hg"
                                    allow="usb; bluetooth"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                ></iframe>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {showSidebar && (
                <aside className="sidebar show">
                    <div className="sidebar-header">
                        <h2>Settings</h2>
                        <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div className="config-list" style={{ marginTop: '2rem' }}>
                        {Object.keys(commands).map(key => (
                            <div key={key} className="config-row">
                                <label>{key}</label>
                                <input
                                    value={commands[key]}
                                    onChange={(e) => setCommands(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                </aside>
            )}
        </div>
    );
}

export default App;
