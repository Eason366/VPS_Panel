import { Layout, Row, Col, Form, Input, Button, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      const res = await axios.post(`http://${window.location.hostname}:8000/api/login`, {
        password: values.password,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success("登录成功！");
        navigate("/dashboard");
      } else {
        message.error(res.data.message || "密码错误");
      }
    } catch (err) {
      message.error("网络异常，请稍后再试");
      console.log(err)
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 300,
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Title level={3} style={{ textAlign: "center" }}>
            登录面板
          </Title>
          <Form onFinish={onFinish}>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default Login;
