const { createApp } = require('./app');

const port = Number(process.env.PORT || 8000);
const app = createApp();

app.listen(port, () => {
  console.log(`Demo application is running on http://localhost:${port}`);
});
