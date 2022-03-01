module.exports = {
  apps : [{
    name   : "backend",
    script : "./src/index.js",
    cwd : "/var/www/backend",
    env_production: {
      NODE_ENV: "production"
   },
   env_development: {
      NODE_ENV: "development"
   },
   env_local: {
      NODE_ENV: "local"
   }
  }]
}
