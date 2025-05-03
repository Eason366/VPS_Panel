import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const TerminalPage = () => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const termInstance = new Terminal({
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
      theme: { background: "#1e1e1e" },
      allowProposedApi: true,  // ✳️ 启用 xterm 插件支持（可选）
    });

    const fitAddon = new FitAddon();
    termInstance.loadAddon(fitAddon);
    termInstance.open(terminalRef.current);
    fitAddon.fit();
    term.current = termInstance;

    const socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/terminal`);
    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    let errorTimeout = setTimeout(() => {
      termInstance.write("\r\n连接超时，请稍后刷新重试。\r\n");
    }, 3000);

    socket.onopen = () => {
      clearTimeout(errorTimeout);
      termInstance.write("已连接到服务器终端\r\n");

      termInstance.onData((data) => {
        const encoded = new TextEncoder().encode(data);
        socket.send(encoded);
      });
    };

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        termInstance.write(new Uint8Array(event.data));
      } else {
        termInstance.write(event.data);
      }
    };

    socket.onerror = () => {
      console.error("WebSocket 出错");
    };

    socket.onclose = () => {
      console.warn("WebSocket 已关闭");
    };

    return () => {
      clearTimeout(errorTimeout);
      socket.close();
      termInstance.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        height: "calc(100vh - 128px)",
        width: "100%",
        backgroundColor: "#1e1e1e",
      }}
    />
  );
};

export default TerminalPage;
