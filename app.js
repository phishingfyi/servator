import express from "express";
import redis from "redis";
import { program } from "commander";
const app = express();

import apiRouter from "./routes/api.js";
import marketingRouter from "./routes/marketing.js"

/**
 * ARGUMENT PARSING
 */
program
    .option('-h, --host <host>', 'host for servator to listen on', process.env.HOST || '127.0.0.1')
    .option('-p, --port <port>', 'port for servator to listen on', process.env.PORT || 3000)
    .option('-u, --urlscan <token>', 'urlscan.io token for scans', process.env.URLSCAN || '')
    .option('-i, --ipapi <token>', 'ip-api.com api token', process.env.IPAPI || '')
    .option('-s, --spur <token>', 'spur.us token', process.env.SPUR || '')
    .option('-r, --redis <url>', 'redis connection string', process.env.REDIS || '');
program.parse();

if (program.opts().redis == '') {
    console.log("No redis connection string provided. Unable to start servator. Exiting.");
    process.exit();
}

/**
 * POST DEFINITIONS
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ROUTE DEFINITIONS
 */
app.use('/api/v1', apiRouter);
app.use('/', marketingRouter);

/**
 * REDIS
 */
let r = null;
try {
    r = redis.createClient(program.opts().redis);
} catch (e) {
    console.log(e);
    process.exit();
}

/**
 * GLOBALS
 */
global.db = r;
global.config = {
    'ttl': process.env.REDIS_TTL || 3600,
    'ipapi': program.opts().ipapi,
    'urlscan': program.opts().urlscan,
    'spur': program.opts().spur
};

/**
 * LISTENER
 */
app.listen(program.opts().port, program.opts().host, () => {
    console.log(`servator listening at ${program.opts().host}:${program.opts().port}`)
});