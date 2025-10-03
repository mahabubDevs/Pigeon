import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import colors from "colors";
import { socketHelper } from "./helpers/socketHelper";
import { Server } from "socket.io";
import seedSuperAdmin from "./DB";
import { subscriptionExpiryCron } from "./helpers/cornJobs/subscriptonExpairs";

// uncaught exception
process.on("uncaughtException", (error) => {
  errorLogger.error("uncaughtException Detected", error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    // create super admin
    seedSuperAdmin();

    await mongoose.connect(config.database_url as string);
    logger.info(colors.green("🚀 Database connected successfully"));

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Worker ${process.pid} listening on port:${config.port}`
        )
      );
    });

    // socket.io
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: { origin: "*" },
    });

    socketHelper.socket(io);
    //@ts-ignore

    subscriptionExpiryCron();

  (global as any).io = io;


  } catch (error) {
    errorLogger.error(colors.red("🤢 Failed to connect Database"), error);
    process.exit(1);
  }

  // handle unhandledRejection
  process.on("unhandledRejection", (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error("UnhandledRejection Detected", error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

// clustering logic

main();

// SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM IS RECEIVE");
  if (server) server.close();
});
