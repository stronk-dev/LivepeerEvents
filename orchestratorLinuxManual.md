Orchestrator Linux setup guide
=============

Running an orchestrator comes with various challenges including setting up, monitoring, troubleshooting and updating your setup.
As plenty of orchestrators are unfamiliar with working in a Linux environment (or working with the command line in general), this document was made with the purpose of guiding them through the process of getting started on a fresh Linux machine.

It will cover the following topics:
- Installing and configuring Livepeer
- Securely accessing a remote server using SSH
- Patching nvidia drivers
- Configuring a firewall using UFW
- Installing and configuring Prometheus statistics for Livepeer
- Installing and configuring Loki log aggregation for Livepeer

Chapters which will get added later:
- Updating or rolling back your orchestrator
- Installing and configuring Grafana
- Configuring Nginx as a reverse proxy to enable HTTPS access to Grafana
- Common log messages which do not indicate an error
- Common error messages and how to fix them

:::info
🛈 This is a draft of the first version, so please let me know if errors pop up while following this guide. Various sections are currently lacking the required explanation as to how or why this works, so feedback on bits that are unclear is welcome.
:::

## Prerequisites
For this guide you only need a very minimal Ubuntu based Linux distribution. As we will only make use of the command line interface, no graphical environment is required

### What flavour of Linux?
If you are coming from Windows and want to run something which is familiar to you, the desktop environment is going to be the most important choice. The power of Linux is that you can freely configure anything, or just stick with whatever is bundled with your distribution. We will not cover switching desktop environments in this document, but feel free to take a look at [what is available](https://fossbytes.com/best-linux-desktop-environments/). If you install Ubuntu from their official website, it will come bundled with their own modified flavour of the gnome shell

:::info
🛈 Linux Mint is an excellent Ubuntu based Linux distribution which lets you choose what desktop environment to use. Their Cinnamon edition of Linux Mint will be very familiar to Windows users and is what I would recommend if you are going to run your orchestrator on a local machine
:::


## Terminal Command Glossary
In case you are unfamiliar with working with the terminal, we will summarize some basic terminal commands which are used throughout this document here

- `sudo` is used to run command as the super user. Sensitive commands can only be run as this user

- `su` is a command to change to another user. You can also switch to the super user (root) by using `sudo su`. If you want to switch to any other user, you have to specify their username: 
    
        su livepeertothemoon
    
    Changes your current user to `livepeertothemoon`
    
- `rm` removes a file

- `nano` is a text editor for the terminal. Use `CTRL+X` to exit a file opened in `nano`

- `cd` navigates to a given directory, eg: 

        cd /home/<username>/.lpData/arbitrum-one-mainnet/keystore
    
    (where `<username>` is the name of your user) brings you to the folder containing your keystore file

- `ls -la` displays the files in the current working directory together with their owners and file permissions. An example of listing the keystore files of the `livepeertothemoon` user:

        ls -la /home/livepeertothemoon/.lpData/arbitrum-one-mainnet/keystore

- The `chown` command sets the owner of a file. It has the following format:
    
        chown <username>:<groupname> /path/to/file
        
- `chmod` can be used to modify file permissions. File permissions in Linux can be a tricky thing, so it is recommended to [read up on this](https://wiki.archlinux.org/title/File_permissions_and_attributes)
An example command to mark a file as an executeable: 

        sudo chmod +x  /usr/local/bin/promtail

- `scp` stands for secure copy and can be used to download and upload data to and from remote machines. For example, if you want to copy over your prometheus data you can download them to a local folder using:

         scp -r root@<oldIp>:/var/lib/prometheus/data ./data
     
    and then upload them to the new server using:
    
        scp -r ./data root@<newIp>:/var/lib/prometheus/
    Be wary that in this example we copy over data as the `root` user, so the owner of the files on the new machine will be root. If the file needs to be read by another user, make sure to change the owner using `chown`

- `ssh` stands for secure shell and is used to log into remote machines. `ssh root@<ip>` will log you into the machine at `<ip>` as the `root` user

- `journalctl` allows you to inspect the logs of a given system service. An example:

      sudo journalctl -u livepeer -n 500 -f
      
    Where `-u livepeer` defines the name of the service we want to inspect, `-n 500` specifies the amount of lines we want to show and `-f` follows the log for newly added log entries

- `systemctl` is used to manage system services. Usually these services get installed and enabled when installing a package, but in this document we will define our own services. Some useful commands:
    - `sudo systemctl enable livepeer` enables the service names livepeer to run at boot
    - `sudo systemctl disable livepeer` disables the service names livepeer to run at boot
    - `sudo systemctl start livepeer` starts the service named livepeer
    - `sudo systemctl stop livepeer` stops the service named livepeer
    - `sudo systemctl restart livepeer` restarts the service named livepeer
    - `sudo systemctl enable --now livepeer` can be run to enable and start a service at the same time
    - `sudo systemctl status livepeer` shows the current status of the service named livepeer
    - `sudo systemctl daemon-reload` reloads system service entries. If you modify any system service, you will have to run this command and then restart the service before any change propagates

- `nvidia-smi` shows you information on any nvidia cards in the system, what driver they have loaded and what programs are currently using them


- `apt-get`: Installing software on Linux usually goes through the package manager bundled with your chosen distribution. Ubuntu based distributions use `apt-get` to manage packages:
    - `apt-get update` updates the list of packages. Run this once in a while so that Linux knows where to find what versions of each package
    - `apt-get upgrade` updates all installed packages

- `ss -tulpn` can be used to list which ports are bound on the local machine. This is useful to see what ports are exposed to the local and remote network
   
  

# Configuring SSH

:::info
⚠ This step is only necessary if you use SSH to access your orchestrator machine
:::

:::warning
⚠ Since SSH is used to take control of a machine, it is also a common attack vector for bots. If you use a password to SSH into your machine, it is recommended to disable this or install a service like `Fail2ban` in order to automatically ban connections which cause authentication errors. The simplest solution is to only allow SSH access using SSH keys
:::


Before using SSH to login to your machine, first generate a SSH key pair if you haven't already by running:
    
    ssh-keygen

We will need your public key later on, as this will allow you to log in to your remote machine without a password. 
Print the contents of your public key:
    
    cat ~/.ssh/id_rsa.pub 
    
And copy this somewhere

Then SSH into your orchestrator machine:
    
    ssh <user>@<ip>

### Enabling authentication using SSH keys

First we will authorize your public key by adding it to the authorized_keys file:

    nano ~/.ssh/authorized_keys
    
Then paste the public key you copied earlier at the end of the file

After your key has been added, test if this was successfull by SSH'ing into the machine from another terminal. If it doesnt ask for a password and immediately logs in, the operation was successfull.

### Disabling SSH using a password

:::warning
⚠ It is important to verify that you can login using your SSH key before disabling SSH access by password. If you SSH into the machine and it still asks for a password, go back to the previous step!
:::

We can disable SSH by password by modifying the sshd config file:

    sudo nano /etc/ssh/sshd_config
    
look for the line `#PasswordAuthentication` and edit this line to: 
    
    PasswordAuthentication no
    
If you cannot find an existing line containing `PasswordAuthentication`, you can insert `PasswordAuthentication no` on any new line in the file

# Setting a firewall using UFW

:::info
⚠ This step is not required if the machine will only run the livepeer orchestrator process, as no sensitive ports are exposed that way. However, it is still recommended to go through this process to get familiar with UFW
:::


UFW (uncomplicated firewall) makes the process of setting up a firewall on Linux effortless. This chapter does not account for any firewall which might be running on you router, so make sure to open up any ports there as well if you're machine is behind a router.

:::warning
⚠ It is important to configure the firewall before enabling it. You don't want to accidentaly close the SSH port if that is your only way to access the machine!
:::


We will need to open port 8935 for the orchestrator, as well as port 22 for SSH access:
 
      sudo ufw allow 8935/tcp
      sudo ufw allow OpenSSH

If you will be running Grafana on this machine, Nginx can be used to allow HTTPS access. Otherwise this step can be skipped

      sudo ufw allow 'Nginx Full'
      
Port 9090 and 3100 can be opened if Grafana is running on another machine and needs to be able to scrape from Prometheus and Loki respectively
      
      sudo ufw allow 9090
      sudo ufw allow 3100
      
:::info
🛈 If you want to take the security one step further, you can allow access to prometheus and loki only from the machine which hosts your Grafana instance by adding `from <IP>` behind it, like `ufw allow 9090 from 8.8.8.8`
:::

Finally enable the firewall and check it's status:

      sudo ufw enable
      sudo ufw status
 

# Installing Livepeer

Start of by installing some basic packages:

      sudo apt-get update && sudo apt-get -y install build-essential pkg-config autoconf git curl clang-8 clang-tools-8 wget curl vim nvidia-driver-515
  

Also create a new user, which we will use to run the orchestrator as:

      sudo adduser livepeertothemoon


### Patch GPU drivers

If you have a consumer-grade GPU, then it's drivers most likely have a transcode limit set by default. In order to use the GPU with Livepeer, you have to patch the drivers to remove this limit. Start of by removing any existing files:

    rm -rf ~/nvidia-patch
    
Then clone the repository containing the patch:

    git clone https://github.com/keylase/nvidia-patch.git ~/nvidia-patch
    
Finally run the patch as root to patch your drivers:

    cd ~/nvidia-patch
    sudo ./patch.sh

:::warning
⚠ Any time the video drivers get updated, this process has to be repeated. You can mark your nvidia drivers to be excluded from updates with the command `sudo apt-mark hold *nvidia*`
:::

### Install the Livepeer binaries

We will install Livepeer using the binaries which they provide on Github. In the example we download version 0.5.32, but it is recommended to check the [releases page](https://github.com/livepeer/go-livepeer/releases) and copy the link to the latest Linux AMD release

    cd /usr/local/bin/
    sudo wget https://github.com/livepeer/go-livepeer/releases/download/v0.5.32/livepeer-linux-amd64.tar.gz
    
Then unpack and remove the compressed file, as we don't need it anymore:

    sudo tar -zxvf livepeer-linux-amd64.tar.gz
    sudo rm livepeer-linux-amd64.tar.gz
    
We also want the `livepeertothemoon` user to be able to access these files:

    sudo chown livepeertothemoon:livepeertothemoon /usr/local/bin/livepeer*

### Getting an Arbitrum enabled RPC URL
Before we can define a system service to run Livepeer with, we need an Arbitrum enabled RPC url. Livepeer uses this to read blockchain data. You can get this from Infura, Alchemy or the [community arbitrum node](https://livepeer.ftkuhnsman.com/accounts/profile/)

:::info
🛈 The community arbitrum node was created by orchestrator `ftkuhnsman` in order to provide a stable Arbitrum endpoint specifically for Livepeer orchestrators. There is a [topic](https://discord.com/channels/423160867534929930/963211379609833532) in the Livepeer Discord channel for discussions or help
:::

### Generating a new keystore file
We also need an Ethereum keystore file. If you don't have an existing one, you can let Livepeer generate a new one by running the program once manually as the `livepeertothemoon` user:

    su livepeertothemoon
    /usr/local/bin/livepeer -network arbitrum-one-mainnet -ethUrl <INSERT YOUR OWN L2 RPC URL> -orchestrator -transcoder
    exit
    
:::warning
⚠ When generating a new keystore file, the program will prompt you for a password. This password is used to decrypt the keystore file and access the private key. Make sure to never share or lose access to either the password or the keystore file
:::


### Migrating an existing Orchestrator
If you already have an orchestrator running somewhere and wish to migrate this to another machine, you need to copy over some files.
First of all, you need to copy over your keystore file, as this contains the private key to your orchestrator. Be aware that if another entity gains control over this file and your password, they can sign and create transactions on behalf of your orchestrator!

The keystore can be found in the following directory on Windows:
  `C:\Users\<username>\.lpData\arbitrum-one-mainnet\keystore`
And on Linux:
  `/home/<username>/.lpData/arbitrum-one-mainnet/keystore`
  
:::info
🛈 If you copied your keystore file from somewhere else, make sure to change the owner of the file to the user we are going to run Livepeer as, otherwise it will not be allowed to read the keystore file. You can change the owner by: `chown livepeertothemoon:livepeertothemoon /home/livepeertothemoon/.lpData/arbitrum-one-mainnet/keystore/*`
:::

If you already have Prometheus setup, you can optionally copy the data directory over so that your statistics don't get reset.
Prometheus data on Linux can usually be found in the `/opt/prometheus/data` directory, but this might differ based on your setup.

### Create a file containing your Orchestrator Ethereum password
Since the livepeer process has to access the orchestrators Ethereum account, we need to store the password to the keystore file somewhere accessible:

    sudo mkdir /usr/local/bin/lptConfig
    sudo nano /usr/local/bin/lptConfig/node.txt
    
Then fill in your password

### Create a system service
Now that we have everything ready for Livepeer to run, we are going to create a system service for it. This way, Livepeer will always run in the background and restart when it crashes or the machine reboots.


      sudo nano /etc/systemd/system/livepeer.service
      
  And insert your own modified version of the example script under the next header. Then you can enable and start the Livepeer process:
      
      sudo systemctl daemon-reload
      sudo systemctl enable --now livepeer

### Example startup script
There are lots of [configuration variables](https://docs.livepeer.org/video-miners/reference/configuration). Be sure to read through them to see what each flag does. Here you will find an example script with my personal preferences

    [Unit]
    Description=Livepeer

    [Service]
    Type=simple
    User=livepeertothemoon
    Restart=always
    RestartSec=4
    ExecStart=/usr/local/bin/livepeer -network arbitrum-one-mainnet \
    -ethUrl <INSERT YOUR OWN L2 RPC URL> \
    -ethAcctAddr <INSERT YOUR OWN ORCHESTRATOR PUBLIC ADDRESS> \
    -ethPassword /usr/local/bin/lptConfig/node.txt \
    -pricePerUnit=999 \
    -orchestrator -transcoder \
    -serviceAddr <INSERT YOUR OWN IP ADDRESS>:8935 \
    -monitor \
    -nvidia 0 \
    -v 6 \
    -maxFaceValue 20000000000000000 \
    -maxSessions=7 \
    -maxGasPrice=40000000000 \
    -autoAdjustPrice=false \
    -metricsPerStream=false -metricsClientIP=false

    [Install]
    WantedBy=default.target
    
:::warning
⚠ The `ExecStart` command contains lots of configuration flags. In order to keep things readable we separate flags by placing a `\` at the end of the line. This means that the command continues on the next line. Note that if the `\` is missing at the end of a line, any flags which follow will not be considered and revert to their default values.
:::

:::info
🛈 One of the important flags to consider is the `reward` flag. In the example it is unset, which means it defaults to true. This way, the orchestrator will automatically try to call reward at the start of each new round. If you don't want your orchestrator to call rewards, you can include `-reward=false \` in the `ExecStart` command
:::

:::info
🛈 Another important flag is the `maxSessions` flag. This is the limit of simultaneous transcodes the orchestrator will accept. This limit varies based on your network speed and GPU, so it is recommended to benchmark how many sessions you GPU can do by following the [official docs](https://docs.livepeer.org/video-miners/guides/benchmarking
)
:::

# Confirming that Livepeer is running

Check the log using `journalctl`:

    sudo journalctl -u livepeer -n 500 -f

    
A successfull installation should look something like this:

```
25 singapore livepeer[182164]: I0414 07:36:25.360817  182164 livepeer.go:271] ***Livepeer is running on the arbitrum-one-mainnet network: 0xD8E8328501E9645d16Cf49539efC04f734606ee4***
Apr 14 07:36:25 singapore livepeer[182164]: I0414 07:36:25.364199  182164 livepeer.go:319] Transcoding on these Nvidia GPUs: [0]
Apr 14 07:36:27 singapore livepeer[182164]: [vp8_cuvid @ 0x3b9c3c0] ignoring invalid SAR: 0/0
Apr 14 07:36:28 singapore livepeer[182164]: I0414 07:36:28.198529  182164 census.go:321] Compiler: gc Arch amd64 OS linux Go version go1.17.6
Apr 14 07:36:28 singapore livepeer[182164]: I0414 07:36:28.198608  182164 census.go:322] Livepeer version: 0.5.29
Apr 14 07:36:28 singapore livepeer[182164]: I0414 07:36:28.198649  182164 census.go:323] Node type orch node ID 0x847791cBF03be716A7fe9Dc8c9Affe17Bd49Ae5e-singapore
Apr 14 07:36:29 singapore livepeer[182164]: I0414 07:36:29.583353  182164 accountmanager.go:63] Found existing ETH account
Apr 14 07:36:29 singapore livepeer[182164]: I0414 07:36:29.583445  182164 accountmanager.go:72] Using Ethereum account: 0x847791cBF03be716A7fe9Dc8c9Affe17Bd49Ae5e
Apr 14 07:36:30 singapore livepeer[182164]: I0414 07:36:30.951579  182164 accountmanager.go:106] Unlocked ETH account: 0x847791cBF03be716A7fe9Dc8c9Affe17Bd49Ae5e
Apr 14 07:36:30 singapore livepeer[182164]: I0414 07:36:30.952586  182164 client.go:195] Controller: 0xD8E8328501E9645d16Cf49539efC04f734606ee4
Apr 14 07:36:31 singapore livepeer[182164]: I0414 07:36:31.248215  182164 client.go:215] LivepeerToken: 0x289ba1701C2F088cf0faf8B3705246331cB8A839
Apr 14 07:36:31 singapore livepeer[182164]: I0414 07:36:31.593745  182164 client.go:235] ServiceRegistry: 0xC92d3A360b8f9e083bA64DE15d95Cf8180897431
Apr 14 07:36:31 singapore livepeer[182164]: I0414 07:36:31.877072  182164 client.go:266] BondingManager: 0x35Bcf3c30594191d53231E4FF333E8A770453e40
Apr 14 07:36:32 singapore livepeer[182164]: I0414 07:36:32.171392  182164 client.go:286] TicketBroker: 0xa8bB618B1520E284046F3dFc448851A1Ff26e41B
Apr 14 07:36:32 singapore livepeer[182164]: I0414 07:36:32.476792  182164 client.go:306] RoundsManager: 0xdd6f56DcC28D3F5f27084381fE8Df634985cc39f
Apr 14 07:36:32 singapore livepeer[182164]: I0414 07:36:32.769816  182164 client.go:327] Minter: 0xc20DE37170B45774e6CD3d2304017fc962f27252
Apr 14 07:36:33 singapore livepeer[182164]: I0414 07:36:33.044485  182164 client.go:347] LivepeerTokenFaucet: 0x0000000000000000000000000000000000000000
Apr 14 07:36:34 singapore livepeer[182164]: I0414 07:36:34.747560  182164 livepeer.go:623] Price: 999 wei for 1 pixels
Apr 14 07:36:34 singapore livepeer[182164]:  
Apr 14 07:36:36 singapore livepeer[182164]: I0414 07:36:36.541053  182164 livepeer.go:1195] Orchestrator 0x847791cBF03be716A7fe9Dc8c9Affe17Bd49Ae5e is active
Apr 14 07:36:36 singapore livepeer[182164]: I0414 07:36:36.818407  182164 block_watcher.go:342] Backfilling block events (this can take a while)...
Apr 14 07:36:36 singapore livepeer[182164]: I0414 07:36:36.818480  182164 block_watcher.go:343] Start block: 9780717                 End block: 9780730                Blocks elapsed: 13
Apr 14 07:36:36 singapore livepeer[182164]: I0414 07:36:36.823479  182164 block_watcher.go:561] fetching block logs from=9780717 to=9780730
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.941428  182164 livepeer.go:1056] ***Livepeer Running in Orchestrator Mode***
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.941481  182164 mediaserver.go:187] Transcode Job Type: [{P240p30fps4x3 600k 30 0 320x240 4:3 0 0 0s 0} {P360p30fps16x9 1200k 30 0 640x360 16:9 0 0 0s 0}]
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.941692  182164 cert.go:83] Private key and cert not found. Generating
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.942171  182164 cert.go:22] Generating cert for 103.176.59.84
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.943158  182164 webserver.go:72] CLI server listening on 127.0.0.1:7935
Apr 14 07:36:37 singapore livepeer[182164]: I0414 07:36:37.946575  182164 rpc.go:197] Listening for RPC on :8935
Apr 14 07:36:39 singapore livepeer[182164]: I0414 07:36:39.948736  182164 rpc.go:237] Received Ping request
```

:::info
🛈 If you ever get stuck you can get help from other orchestrators and core team members in the Livepeer Discord. You can find an invite link on the [official website](https://livepeer.studio/)
:::


Once everything is up and running, you need to activate the orchestrator. There are instructions in the [official documentation](https://docs.livepeer.org/video-miners/getting-started/activation#fund-your-account-with-eth-and-lpt)

# Installing Prometheus
If you are using or planning to use Grafana to monitor your setup, Prometheus needs to be installed in order to scrape [statistics](https://docs.livepeer.org/video-miners/reference/metrics) from the Livepeer process. First we will create a user a user and group to run Prometheus as:

    sudo groupadd --system prometheus
    sudo useradd -s /sbin/nologin --system -g prometheus prometheus
    
Then we download and unpack Prometheus to it's own direcory

    sudo mkdir /opt/prometheus
    cd /opt/prometheus
    sudo curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest | grep browser_download_url | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -
    sudo tar xvzf prometheus*.tar.gz

Now that we have the binaries in the correct place, we need to configure Prometheus to pull data from the Livepeer process. We can remove the bundled example config and create our own:

    sudo rm /opt/prometheus/prometheus.yml
    sudo nano /opt/prometheus/prometheus.yml
    
And paste the following contents:

```
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'livepeer'
    metrics_path: /metrics
    static_configs:
    - targets: ['localhost:7935']
  - job_name: 'gpu'
    static_configs:
    - targets: ['localhost:9101']
```

:::info
🛈 You don't have to include the target for `gpu`. However, if you want to remotely monitor the memory, temperature and usage of your GPU you should keep this in there. There is a chapter in this guide on how to configure `nvidia_exporter` to export GPU statistics.
:::

Now that all files are in place, we can define a system service in order to run prometheus:

    sudo nano /etc/systemd/system/prometheus.service

And paste the following contents:

```
[Unit]
Description=Monitoring system and time series database

[Service]
Restart=always
User=prometheus
ExecStart=/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml --storage.tsdb.retention.time=1y --storage.tsdb.path=/opt/prometheus/data
ExecReload=/bin/kill -HUP $MAINPID
TimeoutStopSec=20s
SendSIGKILL=no
LimitNOFILE=8192

[Install]
WantedBy=multi-user.target
```

:::info
🛈 The `storage.tsdb.retention.time` parameter defines how long statistics are kept in the data folder before they are discarded. The default is 15 days so it is recommended to set this to a higher value, like how we set it to 1 year in the example above
:::

Next we need to set up some file permissions, as the created files need to be readable as the `prometheus` user

    sudo chown -Rfv root:root /opt/prometheus
    sudo chmod -Rfv 0755 /opt/prometheus

We will also need a data folder owned by the `prometheus` user:

    sudo mkdir -v /opt/prometheus/data
    sudo chown -Rfv prometheus:prometheus /opt/prometheus/data

Finally reload the system files and enable the prometheus service

    sudo systemctl daemon-reload
    sudo systemctl enable --now prometheus
    
    
# Setup nvidia_exporter
`nvidia_exporter` is a very simple Go script which exports basic GPU statistics as a Prometheus compatible endpoint. It requires Go to be installed so lets do that first

### Installing Go
Visit the [official website](https://go.dev/doc/install) and copy the link to the official binaries. Then download Go:
    
    wget https://go.dev/dl/go1.18.4.linux-amd64.tar.gz

Remove any existing Go installation and unpack and move the binaries to the correct location:

    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go1.18.4.linux-amd64.tar.gz
    
Lastly make sure that the Go binaries get added to the path of the correct users:

    sudo export PATH=$PATH:/usr/local/go/bin
    su livepeertothemoon
    export PATH=$PATH:/usr/local/go/bin
    
:::info
🛈 The path is an environmental variable that tells the shell which directories to search for executable files
:::

### Installing nvidia_exporter

First download the script:

    cd  /usr/local/bin/lptConfig
    wget https://raw.githubusercontent.com/0xVires/livepeer-grafana-monitoring/main/nvidia_exporter.go

Then create a system service to run nvidia_exporter:

    nano /etc/systemd/system/nvidia_exporter.service 

And paste the following:
```
[Unit]
Description=Nvidia-smi exporter

[Service]
Type=simple
User=livepeertothemoon
Restart=always
RestartSec=12
ExecStart=/usr/local/go/bin/go run /usr/local/bin/lptConfig/nvidia_exporter.go

[Install]
WantedBy=default.target
```

Finally enable the service:

    systemctl daemon-reload
    systemctl enable --now nvidia_exporter

# Installing Loki and Promtail
If you are using or planning to use Grafana to monitor your setup, Loki can be installed in order to be able to view your logs in your dashboard. This can for example be used to monitor for errors.

First we will create the required users:

    sudo useradd --system loki
    sudo useradd --system promtail
    sudo usermod -a -G adm promtail
    
Next we are going to download the binaries and unpack them:

    cd /usr/local/bin
    wget https://github.com/grafana/loki/releases/download/v2.5.0/loki-linux-amd64.zip
    unzip loki-linux-amd64.zip
    rm loki-linux-amd64.zip
    wget https://github.com/grafana/loki/releases/download/v2.5.0/promtail-linux-amd64.zip
    unzip promtail-linux-amd64.zip
    rm promtail-linux-amd64.zip
    
:::info
🛈 Be sure to visit the [releases page](https://github.com/grafana/loki/releases) in order to find the latest download links for promtail and loki
:::


And download the example configuration files:

    wget https://raw.githubusercontent.com/grafana/loki/master/cmd/loki/loki-local-config.yaml
    wget https://raw.githubusercontent.com/grafana/loki/main/clients/cmd/promtail/promtail-local-config.yaml

Next we are going to rename some files:
    
    mv loki-linux-amd64 loki
    mv promtail-linux-amd64 promtail
    mv loki-local-config.yaml loki.yaml
    mv promtail-local-config.yaml promtail.yaml
    
Then configure promtail to read from the Livepeer system service:

    nano promtail.yaml
    
And replace the existing job at the bottom with:

```
- job_name: livepeer
  journal:
    max_age: 48h
    labels:
      job: livepeer
  relabel_configs:
    - action: keep
      source_labels: [__journal__systemd_unit]
      regex: livepeer.service
```

Next up we are going to make sure the `loki` user can access the required files and create a system service for it:

    mkdir /var/lib/loki
    chown loki:loki /var/lib/loki
    chown loki:loki /usr/local/bin/loki*
    nano /etc/systemd/system/loki.service

And paste:
```
[Unit]
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/loki -boltdb.dir /var/lib/loki/index -local.chunk-directory /var/lib/loki/chunks -config.file /usr/local/bin/loki.yaml
TimeoutStopSec=30s
User=loki
Restart=on-failure

NoNewPrivileges=true
MemoryDenyWriteExecute=true
RestrictRealtime=true

ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/loki
PrivateTmp=true

PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

Then enable loki:

    systemctl daemon-reload
    systemctl enable --now loki.service

Nearly done! Let's set up file permissions for the `promtail` user and create a system service for promtail:


    mkdir /var/lib/promtail
    chown promtail:promtail /var/lib/promtail
    chown promtail:promtail /usr/local/bin/promtail*
    nano /etc/systemd/system/promtail.service 

and paste:

```
[Unit]
Requires=network-online.target
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/promtail -positions.file /var/lib/promtail/positions.yml -config.file /usr/local/bin/promtail.yaml
User=promtail
TimeoutStopSec=30s
LimitNOFILE=65536

NoNewPrivileges=true
MemoryDenyWriteExecute=true
RestrictRealtime=true

ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/promtail
PrivateTmp=true

PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

Finally enable promtail: 

    systemctl daemon-reload
    systemctl enable --now promtail.service

:::info
🛈 Remember to use `systemctl` and `journalctl` to check for errors. For example, in order to check the status of the promtail system service you can use `systemctl status promtail.service`. In order to view the logs use `journalctl -u promtail -n 500 -f`
:::



# Deleting the orchestrator
If you've followed this guide, the password to your orchestrator is stored in a text file. Since any super user is able to read this file as well as your keystore, it is a good idea to `shred` these files if you are no longer using the machine.

:::warning
⚠ Make sure to backup the keystore file and password somewhere safe in case you ever need to restore access to your orchestrator.
:::

      shred /home/<username>/.lpData/arbitrum-one-mainnet/keystore/UTC*
      shred /usr/local/bin/lptConfig/node.txt
      

