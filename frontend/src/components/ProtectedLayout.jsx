import { Layout } from "antd";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";

const { Content } = Layout;

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Content style={{ padding: "24px" }}>
          {children}
        </Content>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
