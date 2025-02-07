import express from 'express';
import router from './routes';
import path from 'path';
const app = express();
const PORT = 8080;
app.use(express.json());

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

