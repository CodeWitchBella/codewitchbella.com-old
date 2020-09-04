FROM node:14.9.0-alpine as base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base as builder
COPY package.json yarn.lock /app/
RUN yarn
COPY . /app/
RUN yarn build

FROM base as prod
ENTRYPOINT ["/app/node_modules/.bin/next", "start"]
ENV NODE_ENV=production
EXPOSE 3000
COPY package.json yarn.lock /app/
RUN yarn install --prod
COPY --from=builder /app/.next /app/.next
