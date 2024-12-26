import express from 'express';
import router from './routes';

const app = express();
const PORT = 8080;
app.use(express.json());

app.use('/api', router);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
