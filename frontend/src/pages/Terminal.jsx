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
      theme: {
        background: "#1e1e1e",
      },
    });
  
    const fitAddon = new FitAddon();
    termInstance.loadAddon(fitAddon);
    termInstance.open(terminalRef.current);
    fitAddon.fit();
    term.current = termInstance;
  
    const socket = new WebSocket("ws://localhost:8000/ws/terminal");
    socketRef.current = socket;
  
    let errorTimeout = setTimeout(() => {
      termInstance.write("\r\n连接超时，请稍后刷新重试。\r\n");
    }, 3000); // ⏱️ 等 3 秒再提示“连接失败”
  
    socket.onopen = () => {
      clearTimeout(errorTimeout); // ✅ 成功连接，取消错误提示
      termInstance.write("已连接到服务器终端\r\n");
  
      // 接收输入
      termInstance.onData((data) => {
        socket.send(data);
      });
    };
  
    socket.onmessage = (event) => {
      termInstance.write(event.data);
    };
  
    socket.onerror = () => {
      // 只有超时没取消才写错误
      console.error("WebSocket 出错");
    };
  
    socket.onclose = () => {
      // 只有超时没取消才写关闭
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
        height: "calc(100vh - 128px)", // 扣掉导航栏高度
        width: "100%",
        backgroundColor: "#1e1e1e",
      }}
    />
  );
};

export default TerminalPage;
