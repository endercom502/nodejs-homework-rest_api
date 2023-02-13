const app = require("./app");
require("dotenv").config();
const app = require("./app");

app.listen(process.env.PORT, () => {
  console.log(`Server running. Use our API on port: ${process.env.PORT}`);
});
app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});
