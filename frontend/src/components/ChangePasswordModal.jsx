import { Modal, Form, Input, message } from "antd";
import axios from "axios";

const ChangePasswordModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const res = await axios.post("http://localhost:8000/api/change-password", values);
      if (res.data.success) {
        message.success("密码修改成功");
        onClose();
      } else {
        message.error(res.data.message || "修改失败");
      }
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <Modal
      title="修改密码"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="修改"
      cancelText="取消"
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="old_password" label="旧密码" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="new_password" label="新密码" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
