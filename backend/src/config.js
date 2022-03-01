//Server configuration variables
export const {
    PORT = 42609,
    NODE_ENV = 'local',
    MONGO_URI = "DB PRODUCTION EVIRONMENT MONGODB",
    MONGO_URI_DEV = 'DB TEST EVIRONMENT MONGODB',
    MONGO_URI_LOCAL = 'mongodb://localhost/livepeer',
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret!session',
    SESS_LIFETIME = (1000 * 60 * 60) * 24 * 365,
    API_CMC = "Coinmarketcap API key",
    API_L1_HTTP = "ETH L1 HTTP API KEY",
    API_L2_HTTP = "ETH L2 HTTP API KEY",
    API_L2_WS = "ALCHEMY WSS API KEY"
} = process.env;
