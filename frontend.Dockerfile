FROM node:18 AS builder
WORKDIR VSP_Panel/frontend
COPY frontend/ ./
RUN npm install && npm run build

EXPOSE 4173
CMD ["npm", "run", "preview"]
