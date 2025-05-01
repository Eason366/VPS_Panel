FROM --platform=linux/amd64 node:20.16.0

# 安装基本软件
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    python3.11-venv \
    git \
    zsh \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 配置 Oh My Zsh
RUN curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | sh || true
RUN sed -i 's/^ZSH_THEME=".*"/ZSH_THEME="robbyrussell"/' ~/.zshrc

# 设置zsh为默认shell
RUN chsh -s /bin/zsh

# Python虚拟环境
RUN python3.11 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# 升级pip
RUN pip install --upgrade pip

# 安装pnpm（Node包管理器）
RUN npm install -g pnpm

# 暴露必要端口
EXPOSE 8000 5173

# 默认启动zsh
CMD ["zsh"]
