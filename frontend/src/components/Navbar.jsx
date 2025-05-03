import {
    Layout,
    Menu,
    Dropdown,
    Avatar,
    Popconfirm,
  } from "antd";
  import { useNavigate, useLocation } from "react-router-dom";
  import { UserOutlined } from "@ant-design/icons";
  import { useState } from "react";
  import ChangePasswordModal from "./ChangePasswordModal";
  
  const { Header } = Layout;
  
  const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
  
    const [showPwdModal, setShowPwdModal] = useState(false);
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };
  
    const handleMenuClick = ({ key }) => {
      if (key === "changePassword") {
        setShowPwdModal(true);
      }
    };
  
    const menuItems = [
      { label: "Dashboard", key: "/dashboard" },
      { label: "Terminal", key: "/terminal" },
      { label: "Files", key: "/files" },
    ];
  
    const userMenu = (
      <Menu
        onClick={handleMenuClick}
        items={[
          { label: "修改密码", key: "changePassword" },
          {
            label: (
              <Popconfirm
                title="确定要退出登录吗？"
                okText="退出"
                cancelText="取消"
                onConfirm={handleLogout}
              >
                <span style={{ color: "#ff4d4f" }}>退出登录</span>
              </Popconfirm>
            ),
            key: "logout",
          },
        ]}
      />
    );
  
    return (
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
          style={{ flex: 1 }}
        />
  
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <Avatar
            style={{ cursor: "pointer", marginRight: 16 }}
            icon={<UserOutlined />}
          />
        </Dropdown>
  
        <ChangePasswordModal
          visible={showPwdModal}
          onClose={() => setShowPwdModal(false)}
        />
      </Header>
    );
  };
  
  export default Navbar;
  