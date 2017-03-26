# **LP LINE BOT NOTIFIER**

Send notification to LP line group chat.

### *How to deploy*
    - Clone this repository
    - Create a database called 'LINE-NOTIFICATION' and run this following query
      ```
        CREATE TABLE `reservasi` ( 
         `id` INT(11) NOT NULL AUTO_INCREMENT, 
         `booking_id` INT(11) NULL DEFAULT NULL, 
         PRIMARY KEY (`id`) 
        );
      ```
    - Copy `.env.example` and rename it to `.env`
    - Add your environment configuration there.
    - Run `npm install`

## *Feature(s)*:
#### *Lab Reservation Notification*
This script will send a notification for all non-accepted reservations to line group chat. To use this feature, run this command `node ./src/reservationNotifier.js`. It's recommended to use job scheduller (cron tab) to run this command automatically,
  