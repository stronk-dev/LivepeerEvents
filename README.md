> [!WARNING]
> This repository is no longer maintained - see [StronkBuffer](https://github.com/Stronk-Tech/StronkBuffer) for the new backend, [LivepeerExplorer](LivepeerExplorer) for the new contract explorer, [LivepeerStats](https://github.com/Stronk-Tech/LivepeerStats) for the new monthly stats dashboard and [StronkLanding](https://github.com/Stronk-Tech/StronkLanding) for the new landing page

# What
This project shows a live feed of events happening on the Livepeer BondingManager smart contract. This way it is able to track:
- (De)activations of Orchestrators on the Livepeer network
- Orchestrators calling reward
- Orchestrators updating their commission rates
- Delegators earning staking and fee rewards
- Delegators delegating or moving their delegated stake
- Delegators unbonding their stake

Orchestrators can be inspected by clicking on their address, showing all of their delegators, earned fees and stake

## API endpoints:
View the Wiki for a list of all available endpoints, their parameters and an example of their output

# How

## Frontend
The frontend can be used on it's own as a basis for hosting your own Orchestrator website

### Running Standalone
By default the website will forward all API requests to `http://localhost:42609`
Meaning, it will look for the backend at the same place where the website is running!
If you want to run this frontend without running your own backend, you have to configure it to always pull it's data from the existing API at `https://nframe.nl/`
Modify `package.json` to do this
- Edit the line containing `"proxy": "http://localhost:42609"` and replace `"http://localhost:42609"` with `"https://nframe.nl/"`

## Dependencies
nginx, certbot, certbot-nginx, npm

### HTTPS using nginx
replace `/etc/nginx/nginx.conf` with supplied one, certbot will upgrade it to HTTPS
- `systemctl enable --now nginx.service`
- `certbot --nginx`

## Initial Config
Download copy of repository and change directory to it
- `git clone https://github.com/stronk-dev/LivepeerEvents.git /var/www`
- `cd /var/www`

Download all external dependencies we are using
- `npm install`

### Edit default Orchestrator Address
If you are not running your own backend, by default the backend will return my Orchestrator
In order to show your own Orchestrator on the Grafana page, you need to edit src/util/livepeer.js
Edit the line containing:

    export const getCurrentOrchestratorInfo = () => (
      fetch("api/livepeer/getOrchestrator", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
   And change this to (replace with your own address):

    export const getCurrentOrchestratorInfo = () => (
      fetch("api/livepeer/getOrchestrator/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

All Grafana panels point towards where I am hosting my own Grafana dashboard. You need to edit this to pull the panels from your own Grafana instance
For each panel you want to replace:
- Open your own Grafana page
- Click on the menu of any Panel and click share
- Open the Embed tab
- Copy the entire Embed HTML bit
- Edit src/grafana.js:
- Replace any `iframe` block with the one you copied and edit the height to your liking. The width parameter can be left out so that they scale to the width of the parent element

Note that you can specify the timerange and update frequency in the URL by using URL parameters, like
- `from=now-2d&to=now&refresh=5s`


## Developing
Open the directory of your frontend and run
- `npm start`

Your local environtment is available at `http://localhost:3000/`

## Running or updating in Production
- `cd /var/www`
- `npm run build`



# (Optional) Run your own Backend
Note that running your own backend is not required, since you can also use the existing API at nframe.nl
Nonetheless, running your own backend is recommended so you can make changes as well as keep things quick if you are far away from Western Europe, where nframe.nl is hosted

## Dependencies
nodejs, npm, pm2, mongodb

### Standalone for Prometheus/Grafana
The backend can be run in 'simple' mode. In this mode the entire API stays functioning, except for the /getEvents API call. Perfect for using the API just for pulling the data as JSON or using the Prometheus endpoint and requires much let configuration to set up.

Example Prometheus.yml entry for accessing the API using Prometheus:
    - job_name: 'livepeer'
      scheme: https
      scrape_interval: 30s
      metrics_path: /api/livepeer/prometheus/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e
      static_configs:
      - targets: ['nframe.nl']
### MongoDB Cloud
If not running the backend in simple mode, the free tier of MongoDB Cloud Services is recommended in order to store blockchain Events persistently. Otherwise the backend has to parse all blockchain events each time it boots

## Initial Config
Download copy of repository and change directory to it
- `git clone https://github.com/stronk-dev/LivepeerEvents.git /var/www`
- `cd /var/www/backend`

Download all external dependencies we are using
- `npm install`

Set configuration variables
- `nano /var/www/backend/src/config.js`
- `PORT` can be left as is, defines at what port the backend will accept API requests
- `NODE_ENV` can be left as is, defines the default way to connect to the database
- `MONGO_URI` should be edited to the URL of your MongoDB instance. This is where the backend stores it's data when it is running in production mode
- `MONGO_URI_DEV` should be edited to the URL of your MongoDB instance. This is where the backend stores it's data when it is running in development mode
- `MONGO_URI_LOCAL` can be left as is, this is where the backend stores it's data when it is running in local mode
- `API_CMC` should be edited to contain your own coinmarketcap api key
- `API_L1_HTTP` should be edited to the HTTP url of a L1 ethereum node
- `API_L2_HTTP` should be edited to the HTTP url of a L2 ethereum node
- `API_L2_WS` should be edited to the WS url of an Arbitrum mainnet Alchemy node
- `CONF_DEFAULT_ORCH` should be edited to the public address of your own Orchestrator. This is the default Orchestrator the backend will return
- `CONF_SIMPLE_MODE` if set to true, will disable live smart contract monitoring. Also disabled all MONGO related functionalities. Config flags `API_L2_WS`, `MONGO_URI`, `MONGO_URI_DEV` and `MONGO_URI_LOCAL` can be ignored if this flag is set to true.
- `CONF_TIMEOUT_CMC` time in milliseconds of how long coinmarketcap data is kept in the cache before a new request is made. Recommended is around 5-6 minutes in order to stay below the default daily soft cap
- `CONF_TIMEOUT_ALCHEMY` time in milliseconds of how long blockchain information, like gas prices, is being kept in the cache
- `CONF_TIMEOUT_LIVEPEER` time in milliseconds of how long livepeer data, like orchestrator and delegator information, is being kept in the cache
- `CONF_DISABLE_SYNC` set to true to disable syncing events and tickets at boot
- `CONF_DISABLE_DB` set to false to disable persistent storage of events and tickets into a mongodb database
- `CONF_DISABLE_CMC` set to false to disable coin quotes using CMC
## Developing
Open the directory of your backend and run
- `npm run dev`

## Running in Production
Open the directory of your backend and run the backend using `pm2`
- `cd /var/www/backend`
- `pm2 start ecosystem.config.js --env production`

Save the current pm2 process list configuration
- `pm2 save`

Automatically start the backend when the server reboots
- `pm2 startup`

## Updating in Production
- `pm2 restart backend`

## Other commands
View logs
- `pm2 log backend`

Stop the entire thing
- `pm2 stop backend`
