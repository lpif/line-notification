'use strict';

const helper = require('./helpers');
const dotenv = require('dotenv');
const _ = require('lodash');

let closure = {};
dotenv.config();

helper.getBookingData()
	.then((reservationList) => {		
		closure.reservationList = reservationList;
		return helper.getNotificationData(reservationList);
	})
	.then((notificationData) => {
		let notifiedReservation = _.map(notificationData, (cur) => {			
			return cur.booking_id;
		});
		closure.reservationList = _.filter(closure.reservationList, (curr) => {
			return _.indexOf(notifiedReservation, curr.id) === -1;
		});		
		return helper.insertNotification(closure.reservationList);
	})
	.then((result) => {
		closure.message = '\nReservations list:\n'
		closure.message += _.reduce(closure.reservationList, (result, current) => {			
			let temp = '- Reservation by ' + current.name + ' for ' + current.title + ' (' + current.startTime + ' to ' + current.endTime + '). Reserved at ' + current.reserveTime + '\n';
			result += temp;
			return result;
		}, '');
		closure.message += 'PS: Semangat mengerjakan TA mas Wawan';
		if (closure.reservationList.length === 0) {			
			process.exit();
		}		
		return helper.sendLineNotification(closure.message);
	})
	.then((response) => {
		console.log(response);
		process.exit();
	})
	.catch((err) => {
		console.log(err);
	});