import express, { type Express, type Request, type Response, type NextFunction } from 'express';

const app: Express = express();

const myLogger = function (req: Request, res: Response, next: NextFunction) {
  console.log('LOGGED');
  next();
};

app.use(myLogger);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(3000);

console.log("server running on localhost:3000");