import requests
import datetime
from time import sleep

def send_ddns_update_request(host, domain_name, ddns_password):
    #CONFIG VARIABLE - CHANGE THIS URL TO THE URL FORMAT OF YOUR DNS SERVICE; DEFAULTS TO NAMECHEAP DYNAMICDNS
    url = f"https://dynamicdns.park-your-domain.com/update?host={host}&domain={domain_name}&password={ddns_password}"
    currentTimeStamp = datetime.datetime.now().strftime('[%Y-%m-%d %H:%M:%S]')
    print(f"{currentTimeStamp}: Sending DNS Update Request to {domain_name}")
    response = requests.get(url)

    if response.status_code == 200:
        currentTimeStamp = datetime.datetime.now().strftime('[%Y-%m-%d %H:%M:%S]')
        print(f"{currentTimeStamp}: Received a valid HTML 200 Response code:")
        print("======================")
        print("FULL RESPONSE:\n")
        print(response.content.decode("utf-8"))
        print("\nEND OF RESPONSE")
    else:
        currentTimeStamp = datetime.datetime.now().strftime('[%Y-%m-%d %H:%M:%S]')
        print(f"{currentTimeStamp} WARN: Failed to receive a valid HTML 200 Response code. Received {response.status_code} instead.")

def main():

    #CONFIG VARIABLES

    #The host prefix of the domain, ex: the www in www.google.ca
    host = "@"

    #The domain name in question.   ex: google.ca
    domain_name = "uniplanner.ca"

    #The password for your Dynamic DNS.
    ddns_password = "82abe8cce97b4f36a54ef1f904c5cc30"

    #The frequency (in seconds) between updates. Set to 0 or below to only update once.
    update_frequency = 300
    startingTime = datetime.datetime.now()

    if update_frequency > 0:

        requestCounter = 0

        currentTimeStamp = datetime.datetime.now().strftime('[%Y-%m-%d %H:%M:%S]')
        print(f"{currentTimeStamp}: Starting Dynamic DNS update script with interval {update_frequency} seconds between requests.")

        while True:
            print("Sending request " + str(requestCounter))
            print("Script has been running for " + str(datetime.datetime.now()-startingTime) + " seconds.")
            send_ddns_update_request(host, domain_name, ddns_password)
            requestCounter = requestCounter + 1
            sleep(update_frequency)
    else:
        send_ddns_update_request(host, domain_name, ddns_password)
        currentTimeStamp = datetime.datetime.now().strftime('[%Y-%m-%d %H:%M:%S]')
        print(f"{currentTimeStamp}: Update request complete. Check the response text to validate Dynamic DNS update.")

if __name__ == "__main__":
    main()