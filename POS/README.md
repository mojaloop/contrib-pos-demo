## POS Driver

POS driver is a terminal driving application that drives the pinpad/pos devices. The application is implemented on the devices to drive the POS and mobile POS devices and enables the devices to perform and process transactions originated throuhg Cards, QRC, etc.

### Use Case II

#### Merchant-Initiated Merchant Payment Authorized on POS

The POS driving application has been customised to integrate with Mojaloop throuhg ISO 8583 - Open API integration. The merchant initiates a merchant payment transaction using a POS device. This device has the capability to capture the customer’s authorization on POS instead of the customer’s mobile device. The authorization information captured in POS should be sent to Payer FSP to perform the authorization. The business process involves two parties, Merchant and Customer. The merchant initiates a request to pay for the customer, and the customer reviews the payment request on POS and authorizes the payment by OTP or QR code on the POS itself. The customer authentication information is sent from Payee  FSP to Payer FSP for authentication by Payer FSP. If authentication is successful then transaction will be posted on Payer FSP and Payee FSP.

#### Transaction flow

- Customer requests for an OTP ( pre-generate OTP using mobile app/CMS)
- Merchant will initiate payment for the desired amount and Customer ID through POS device.
- The request will be converted from ISO to OPEN API and will be sent to Mojaloop. From there account lookup will be done and the request will be send to Payer FSP for authorization.
- The Payer FSP validates the transaction request and also calculate the Quote for the transaction.
- The calculated Quote will be displayed on the Terminal for confirmation by the Payee. 
- The Payer FSP will authorize the transaction with dynamic OTP (or QR Code) which is generated through mobile application and entered by the customer.
- If Payer FSP authorizes the transaction, funds will be sent to Merchant (Payee) FSP. If Payer FSP declines, the transaction will be aborted. 
- Response will be sent back to POS driver through Mojaloop in OPEN API. It will be converted to ISO(POS) and will send the response to POS.
- Notification will be sent to Payer and Payee from respective FSP’s

### Prerequisite software stack

- Android Studio
- Eclipse
- MYSQL server
- Tomcat server

## Mojaloop Integration

The POS Driving solution mainly comprises of an Android Application and a Webservice. Through the POS device payer information such as mobile number or account number and amount is obtained. This information is then sent to the Webservice which processes to ISO8583 JSON message.
In the first stage, the Application retrieves serial number of the POS and sends it to the webservice in JSON format. The webservice then checks its database to see if such a device has been registered or not. If it has a matching entry, then, it would send back related information to the Android application in JSON format. 

The database contains entries serial number, merchant id, terminal id etc. So, when a certain device tries to access the webservice, it must go through a check to see if the device is valid or not. In case the device has already been registered, then it is permitted to access the webservice. The webservice would then respond by sending back its Merchant ID and Terminal ID to the android application. And in case the device is not registered, it will be denied the access.

The ISO8583 message is then sent to Mojaloop. This message is mapped by POS Endpoint to Open API format. The OTP endpoint is implemented to generate random OTP. The Payer FSP will authorize the transaction with dynamic OTP (or QR Code) which is sent through the POS device, as entered by the customer. Response will be sent back to POS driver through Mojaloop in Open API and converted to ISO format at the POS Endpoint. Notification will be sent to Payer and Payee from respective FSP’s.






