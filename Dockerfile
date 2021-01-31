FROM emscripten/emsdk:2.0.13 as emscripten
COPY compile-cpp.sh /src/
COPY cpp-src /src/cpp-src
RUN /bin/bash compile-cpp.sh

FROM node:14.15.4-alpine as base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base as builder
COPY package.json yarn.lock /app/
RUN yarn
COPY . /app/
RUN yarn eslint
RUN yarn build

FROM base as prod
ENTRYPOINT ["/app/entrypoint.sh"]
ENV NODE_ENV=production
EXPOSE 3000
COPY package.json yarn.lock /app/
RUN yarn install --prod
COPY public /app/public
COPY --from=emscripten /src/public/wasm /app/public/wasm
COPY entrypoint.sh /app/
COPY --from=builder /app/.next /app/.next
