
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
- https://nframe.nl/api/livepeer/grafana
  - Returns a JSON object of top 200 coin data, as well as gas fees and contract prices
- https://nframe.nl/api/livepeer/cmc
  - Returns a JSON object of the raw data of the top 200 coins
- https://nframe.nl/api/livepeer/blockchains
  - Returns a JSON object of gas fees and livepeer contract fees on L1 and L2
- https://nframe.nl/api/livepeer/quotes
  - Returns a JSON object of top 200 coint data by coin symbol
- https://nframe.nl/api/livepeer/getEvents
  - Returns a JSON object of the raw data of all events on the Livepeer BondingManager contract
- https://nframe.nl/api/livepeer/getEvents
  - Returns a JSON object of the raw data of all events on the Livepeer BondingManager contract
- https://nframe.nl/api/livepeer/getOrchestrator
    - POST request with orchAddr in the body
- https://www.nframe.nl/livepeer/getOrchestrator?orchAddr=0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e
  - GET requests with the orchAddr as URL parameter
  - Returns a JSON object of the current data on the given Orchestrator
- https://www.nframe.nl/livepeer/getOrchestrator
  - Returns a JSON object of the default Orchestrator selected in the backend

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
nodejs, npm, pm2

## Initial Config
Download copy of repository and change directory to it
- `git clone https://github.com/stronk-dev/LivepeerEvents.git /var/www`
- `cd /var/www/backend`

Download all external dependencies we are using
- `npm install`
- 
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