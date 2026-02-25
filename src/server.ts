import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.app.port, () => {
  console.log(`Server running on http://localhost:${config.app.port}`);
});
