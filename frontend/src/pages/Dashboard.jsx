import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table } from "antd";
import ReactECharts from "echarts-for-react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 1000); // 每秒刷新
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:8000/api/stats`);
      setData(res.data);
    } catch {
      console.error("无法获取系统状态");
    }
  };

  if (!data) {
    return <div style={{ padding: 24 }}>加载中.</div>
  };

  const ringChart = (title, percent, color) => ({
    title: {
      text: title,
      left: "center",
      top: "5%",
      textStyle: { fontSize: 16 },
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: ["60%", "85%"],
        center: ["50%", "58%"], // 调整中心位置避免遮挡
        avoidLabelOverlap: false,
        label: {
          position: "center",
          formatter: `${percent.toFixed(1)}%`,
          fontSize: 18,
          fontWeight: "bold",
        },
        data: [
          { value: percent, name: "Used" },
          { value: 100 - percent, name: "Free" },
        ],
        color: [color, "#f0f2f5"],
      },
    ],
  });

  const processColumns = [
    {
      title: "PID",
      dataIndex: "pid",
      width: 80,
      align: "center",
    },
    {
      title: "进程名",
      dataIndex: "name",
      width: 200,
      ellipsis: true,
      render: (text) => <span style={{ fontFamily: "monospace" }}>{text}</span>,
    },
    {
      title: "CPU (%)",
      dataIndex: "cpu_percent",
      width: 100,
      align: "right",
      render: (v) => v.toFixed(1),
    },
    {
      title: "内存 (%)",
      dataIndex: "memory_percent",
      width: 100,
      align: "right",
      render: (v) => v.toFixed(1),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {/* CPU 卡片 */}
        <Col xs={24} md={8}>
          <Card style={{ height: "100%" }}>
            <ReactECharts option={ringChart("CPU 使用率", data.cpu.percent, "#1890ff")} style={{ height: 240 }} />
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Statistic title="物理核心数" value={data.cpu.cores} />
              </Col>
              <Col span={12}>
                <Statistic title="线程数" value={data.cpu.threads} />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 内存卡片 */}
        <Col xs={24} md={8}>
          <Card style={{ height: "100%" }}>
            <ReactECharts option={ringChart("内存使用率", data.memory.percent, "#52c41a")} style={{ height: 240 }} />
            <Statistic
              title="总内存 (GB)"
              value={(data.memory.total / 1024 ** 3).toFixed(2)}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>

        {/* 磁盘卡片 */}
        <Col xs={24} md={8}>
          <Card style={{ height: "100%" }}>
            <ReactECharts option={ringChart("磁盘使用率", data.disk.percent, "#faad14")} style={{ height: 240 }} />
            <Statistic
              title="总磁盘 (GB)"
              value={(data.disk.total / 1024 ** 3).toFixed(2)}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="系统运行时间" value={data.uptime.uptime} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均负载"
              value={`${data.load.load_1.toFixed(2)} / ${data.load.load_5.toFixed(2)} / ${data.load.load_15.toFixed(2)}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="上传速率" value={(data.network.sent_rate / 1024).toFixed(1)} suffix="KB/s" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="下载速率" value={(data.network.recv_rate / 1024).toFixed(1)} suffix="KB/s" />
          </Card>
        </Col>
      </Row>

      <Card title="Top 进程 (按 CPU 使用)" style={{ marginTop: 32 }}>
        <Table
          dataSource={data.top_processes}
          columns={processColumns}
          rowKey="pid"
          pagination={false}
          size="small"
          scroll={{ x: 500 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
