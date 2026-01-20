const { start } = require("./app");

// Start the application
start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
