# Grundsalg maps proxy
This is a NodeJS base application that fetches information used to display in 
grundsalg maps.

## Required

* Apache 2.4
* Redis 2.8
* Node 7.x
* Supervisor

## Installation

Run the install.sh script to install all the NPM modules required be the 
application. Next copy __example.config.json__ to __config.json__ and change 
the values in the config file.

## Apache proxy
To make the application available through http and https ports use the following
apache 2.4 configuration.

```
<VirtualHost *:80>
	ServerName proxy.<domain>.dk

	Redirect 301 /  https://proxy.<domain>.dk/

	ErrorLog <path>/logs/apache_error.log

	# Possible values include: debug, info, notice, warn, error, crit,
	# alert, emerg.
	LogLevel warn

	CustomLog <path>/logs/apache_access.log combined
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost _default_:443>
	ServerName proxy.<domain>.dk

  ProxyPreserveHost On
	ProxyPass / http://localhost:3010/

	ErrorLog <path>/logs/apache_error.log

	# Possible values include: debug, info, notice, warn, error, crit,
	# alert, emerg.
	LogLevel warn

	CustomLog <path>/logs/apache_ssl_access.log combined

	#   SSL Engine Switch:
	#   Enable/Disable SSL for this virtual host.
	SSLEngine on

	SSLCertificateKeyFile    <path>privkey.pem
	SSLCertificateFile       <path>cert.pem
	SSLCertificateChainFile  <path>chain.pem


	<FilesMatch "\.(cgi|shtml|phtml|php)$">
		SSLOptions +StdEnvVars
	</FilesMatch>
	<Directory /usr/lib/cgi-bin>
		SSLOptions +StdEnvVars
	</Directory>

	BrowserMatch "MSIE [2-6]" nokeepalive ssl-unclean-shutdown downgrade-1.0 force-response-1.0
	# MSIE 7 and newer should be able to use keepalive
	BrowserMatch "MSIE [17-9]" ssl-unclean-shutdown
</VirtualHost>
</IfModule>
```

## Supervisor
To make the node application run at all time use supervisor.

```
nano -w /etc/supervisor/conf.d/proxy.conf
```

```
[program:maps-proxy]
command=node <path>/app.js
autostart=true
autorestart=true
environment=NODE_ENV=production
stderr_logfile=/var/log/maps_proxy.err.log
stdout_logfile=/var/log/maps_proxy.out.log
user=deploy
```
