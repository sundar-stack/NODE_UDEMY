//server
const dotenv = require("dotenv")
const app = require('./index')

dotenv.config({path:"./config.env"})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on ${PORT}.....`);
});