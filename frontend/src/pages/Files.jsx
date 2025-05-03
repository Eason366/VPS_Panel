import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Upload,
  message,
  Modal,
  Space,
  Dropdown,
} from "antd";
import {
  FolderFilled,
  FileOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import path from "path-browserify";

const Files = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [fileInfo, setFileInfo] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editPath, setEditPath] = useState("");

  const [creatingType, setCreatingType] = useState(null);
  const [creatingModalVisible, setCreatingModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/files", {
        params: { path: currentPath },
      });
      setItems(res.data.items);
    } catch {
      message.error("文件列表加载失败");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const handleEnter = (item) => {
    if (item.is_dir) {
      setCurrentPath(path.join(currentPath, item.name));
    }
  };

  const handleBack = () => {
    setCurrentPath(path.dirname(currentPath));
  };

  const uploadProps = {
    name: "file",
    action: "http://localhost:8000/api/upload",
    data: { path: currentPath },
    showUploadList: false,
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} 上传成功`);
        fetchFiles();
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const handleRightClick = (e, item) => {
    e.preventDefault();
    setSelectedItem(item);
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  const showFileInfo = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/file/info", {
        params: { path: path.join(currentPath, selectedItem.name) },
      });
      setFileInfo(res.data);
      setInfoModalVisible(true);
    } catch {
      message.error("获取文件信息失败");
    }
  };

  const handleEdit = async (item) => {
    const filePath = path.join(currentPath, item.name);
    try {
      const res = await axios.get("http://localhost:8000/api/file/read", {
        params: { path: filePath },
      });
      setEditPath(filePath);
      setEditContent(res.data.content);
      setEditModalVisible(true);
    } catch {
      message.error("无法读取文件内容");
    }
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:8000/api/file/save", {
        path: editPath,
        content: editContent,
      });
      message.success("保存成功");
      setEditModalVisible(false);
    } catch {
      message.error("保存失败");
    }
  };

  const onMenuClick = ({ key }) => {
    setContextMenuVisible(false);
    const fullPath = path.join(currentPath, selectedItem.name);

    if (key === "info") {
      showFileInfo();
    } else if (key === "download") {
        const fullPath = path.join(currentPath, selectedItem.name);
        const link = document.createElement("a");
        link.href = `http://localhost:8000/api/download?path=${encodeURIComponent(fullPath)}`;
        link.download = selectedItem.is_dir ? `${selectedItem.name}.zip` : selectedItem.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (key === "delete") {
      Modal.confirm({
        title: "确认删除？",
        content: `确定要删除 ${selectedItem.name} 吗？`,
        onOk: async () => {
          try {
            await axios.post("http://localhost:8000/api/file/delete", {
              path: fullPath,
            });
            message.success("删除成功");
            fetchFiles();
          } catch {
            message.error("删除失败");
          }
        },
      });
    }
  };

  const handleCreate = (type) => {
    setCreatingType(type);
    setCreatingModalVisible(true);
    setNewName("");
  };

  const handleConfirmCreate = async () => {
    if (!newName) {
      message.error("名称不能为空");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/file/create", {
        path: path.join(currentPath, newName),
        type: creatingType,
      });
      message.success("创建成功");
      fetchFiles();
    } catch {
      message.error("创建失败");
    } finally {
      setCreatingModalVisible(false);
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (_, item) => (
        <div
          onContextMenu={(e) => handleRightClick(e, item)}
          onDoubleClick={() => {
            if (item.is_dir) {
              handleEnter(item);
            } else if (/\.(txt|py|md|json|js|log|gitignore|env|dockerignore|xml|yml|Dockerfile|)$/i.test(item.name)) {
              handleEdit(item);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <Space>
            {item.is_dir ? (
              <FolderFilled style={{ color: "#faad14" }} />
            ) : (
              <FileOutlined />
            )}
            {item.name}
          </Space>
        </div>
      ),
    },
    {
      title: "大小",
      dataIndex: "size",
      width: 120,
      render: (s) => (s > 0 ? `${(s / 1024).toFixed(1)} KB` : "-"),
    },
    {
      title: "修改时间",
      dataIndex: "modified",
      width: 180,
    },
  ];

  return (
    <div style={{ padding: 24 }} onClick={() => setContextMenuVisible(false)}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            disabled={!currentPath}
          >
            上一级
          </Button>
          <span>当前路径: {currentPath || "/"}</span>
        </Space>

        <Space>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传文件</Button>
          </Upload>
          <Button onClick={() => handleCreate("file")}>新建文件</Button>
          <Button onClick={() => handleCreate("folder")}>新建文件夹</Button>
        </Space>
      </div>

      <Table
        dataSource={items}
        columns={columns}
        rowKey="name"
        loading={loading}
        pagination={false}
        size="middle"
      />

      {contextMenuVisible && (
        <div
          style={{
            position: "fixed",
            top: menuPosition.y,
            left: menuPosition.x,
            zIndex: 1000,
          }}
        >
          <Dropdown
            menu={{
              items: [
                { label: "查看信息", key: "info" },
                { label: "下载", key: "download" },
                { label: "删除", key: "delete", danger: true },
              ],
              onClick: onMenuClick,
            }}
            open
          >
            <div />
          </Dropdown>
        </div>
      )}

      <Modal
        open={infoModalVisible}
        title="文件信息"
        onCancel={() => setInfoModalVisible(false)}
        footer={null}
      >
        {fileInfo && (
          <ul>
            <li><strong>名称：</strong> {fileInfo.name}</li>
            <li><strong>类型：</strong> {fileInfo.is_dir ? "文件夹" : "文件"}</li>
            <li><strong>大小：</strong> {(fileInfo.size / 1024).toFixed(2)} KB</li>
            <li><strong>修改时间：</strong> {fileInfo.modified}</li>
            <li><strong>路径：</strong> {fileInfo.path}</li>
          </ul>
        )}
      </Modal>

      <Modal
        open={editModalVisible}
        title={`编辑文件：${path.basename(editPath)}`}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSave}
        width={800}
      >
        <textarea
          style={{ width: "100%", height: "400px", fontFamily: "monospace" }}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
        />
      </Modal>

      <Modal
        open={creatingModalVisible}
        title={`新建${creatingType === "file" ? "文件" : "文件夹"}`}
        onCancel={() => setCreatingModalVisible(false)}
        onOk={handleConfirmCreate}
      >
        <input
          style={{ width: "100%" }}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="请输入名称"
        />
      </Modal>
    </div>
  );
};

export default Files;
