# Nexus Control: micro:bit robot dashboard

A web dashboard that controls BBC micro:bit robots from the browser using **Web Bluetooth** (the Nordic UART service over BLE). Built with React and Vite.

**Live:** https://makerworkslab.in/Micro-Bit-control-App/

## Modes

The app has separate panels for different ways of driving the robot:

- **Joystick mode**
- **Gesture mode**
- **Voice mode**
- **Record mode**
- **Mission planner**
- **MakeCode panel**

## Documentation

- [`INSTRUCTION.md`](INSTRUCTION.md): how to use the app.
- [`TECHNICAL_GUIDE.md`](TECHNICAL_GUIDE.md): how Web Bluetooth UART communication works and how the app is put together.

## Run it

```bash
npm install
npm run dev
```

Use a browser with Web Bluetooth support, such as Chrome or Edge, and a micro:bit running the matching program.

Built by [Ajay Ummadi](https://makerworkslab.in/ajayummadi/) at [MakerWorks Lab](https://makerworkslab.in/), Mumbai.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Ajay Ummadi.
