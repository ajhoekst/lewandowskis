using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    (name = "market-ts", worker = (
      compatibilityDate = "2026-10-14",
      modules = [
        (name = "worker", esModule = embed "dist/worker.js"),
      ],
      bindings = [
        (name = "ASSETS", service = "assets"),
        (name = "STATIC", service = "static"),
        (name = "TEMPLATES", service = "templates"),
      ],
    )),
    (name = "assets", disk = (path = "assets", writable = false)),
    (name = "static", disk = (path = "static", writable = false)),
    (name = "templates", disk = (path = "templates", writable = false)),
  ],
  sockets = [
    (name = "http", address = "127.0.0.1:8787", http = (), service = "market-ts"),
  ],
);
