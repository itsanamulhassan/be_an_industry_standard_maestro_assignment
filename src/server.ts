/* eslint-disable no-console */
import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import initializeDefaultUser from "./app/utils/initializeDefaultUser";
import environments from "app/configurations/environments";

let server: Server;

const main = async () => {
  try {
    await mongoose.connect(environments.db_url);
    console.log("✅ Server has been connected successfully with Database");

    server = app.listen(environments.port, () =>
      console.log(
        "Server has been connected with the port of ",
        environments.port
      )
    );
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await main();
  await initializeDefaultUser();
})();

// Catch unhandled promise rejections that were never .catch()-ed
// This ensures the server shuts down gracefully instead of crashing unpredictably
process.on("unhandledRejection", (error) => {
  console.log("Unhandled rejection detected ... Server shutting down", error);

  if (server) {
    // Close the server first so it stops accepting new connections
    server.close(() => {
      process.exit(1); // Exit the process with failure code
    });
  } else {
    // If server wasn't initialized yet
    process.exit(1);
  }
});

// Catch exceptions that weren't caught anywhere in the app
// Prevents the Node process from crashing suddenly with unhandled errors
process.on("uncaughtException", (error) => {
  console.log("Uncaught exception error... Server shutting down", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM signal (sent by systems to tell process to shut down)
// For example, in production, a container orchestrator or server manager
// might send SIGTERM when stopping or redeploying the app
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received... server shutting down");

  if (server) {
    // Graceful shutdown: finish existing connections
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
