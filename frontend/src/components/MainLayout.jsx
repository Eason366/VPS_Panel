import { Layout, Menu } from "antd";
import { DesktopOutlined, CodeOutlined, FolderOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate, Routes, Route } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/dashboard",
      icon: <DesktopOutlined />,
      label: "Dashboard",
    },
    {
      key: "/terminal",
      icon: <CodeOutlined />,
      label: "Terminal",
    },
    {
      key: "/files",
      icon: <FolderOutlined />,
      label: "Files",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={(item) => navigate(item.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, textAlign: "center", fontWeight: "bold" }}>
          VPS 控制面板
        </Header>
        <Content style={{ margin: "16px", background: "#fff", padding: 24 }}>
          <Routes>
            <Route path="/dashboard" element={<div>Dashboard 内容</div>} />
            <Route path="/terminal" element={<div>Terminal 内容</div>} />
            <Route path="/files" element={<div>Files 内容</div>} />
          </Routes>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
