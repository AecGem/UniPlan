# Dynamic-DNS-Client
A lightweight script that sends an IP update request to a single Dynamic DNS Registry at a regular interval. Once every `x` seconds, the script will send an HTTP request to your Dynamic DNS Provider. If the request is successful, the Dynamic DNS will then point to the IP address the script originates from. A full XML readout of the HTTP request is shown after every update attempt. If the update is unsuccessful, a `WARN` will display in the shell.

## Dependencies
The script runs on Python 3.5+, with the following packages:
`requests` - You may have to run `pip install requests` to install this package. It handles

## Setup
No installation is required; you just have to change a few variables in the config section of the script, and then run it. Set the following values (located in the `main()` function) as described:

  #### host
  The prefix of the domain you wish to update. For most use cases, the default value `@` works fine. Otherwise, you can specify a wildcard `*` or a specific prefix (`www`, `info`, `ww2`, etc.)

  #### domain_name
  The domain you are updating, without any prefix. Ex: `google.ca`

  #### ddns_password
  The password provided to you by your Dynamic DNS provider for your domain.

  #### update_frequency
  The interval, in seconds, that will pass between updates. For example, setting this to 60 will send an update request once every minute (60 seconds.)