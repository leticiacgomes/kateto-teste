FROM mcr.microsoft.com/devcontainers/javascript-node

USER node

# Install pnpm
RUN npm install -g pnpm

# Add pnpm to PATH
RUN echo 'export PNPM_HOME="/home/node/.local/share/pnpm"' >> /home/node/.bashrc && \
    echo 'case ":$PATH:" in' >> /home/node/.bashrc && \
    echo '  *":$PNPM_HOME:"*) ;;' >> /home/node/.bashrc && \
    echo '  *) export PATH="$PNPM_HOME:$PATH" ;;' >> /home/node/.bashrc && \
    echo 'esac' >> /home/node/.bashrc

RUN mkdir -p /home/node/.claude

RUN curl -fsSL https://claude.ai/install.sh | bash
