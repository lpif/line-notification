'use strict';

const Bluebird = require('bluebird');
const mysql = require('promise-mysql');
const request = Bluebird.promisify(require('request'));
const _ = require('lodash');

/***
 * Helper to get unvalidate booking data
 * @author Dewangga <dewangga.winardi@gmail.com>
 * @returns {Promise.<TResult>}
 */
exports.getBookingData = () => {
	let connection;
	return mysql.createConnection({
		host     : process.env.RESERVATION_DATABASE_HOST,
		user     : process.env.RESERVATION_DATABASE_USER,
		password : process.env.RESERVATION_DATABASE_PASSWORD,
		database : process.env.RESERVATION_DATABASE_DB
	})
	.then((conn) => {
		connection = conn;
		let queryString = 'select b.*, u.name , s.`start` , s.`end` from bookings b, users u, schedules s where validation_by=0 and b.user_id = u.id and b.id = s.booking_id';	
		return connection.query(queryString);
	})
	.then((results) => {
		let reservationList = [];
		reservationList = _.map(results, (rowData) => {
			return {
				id: rowData.id,
				title: rowData.title,
				name: rowData.name,
				reserveTime: rowData.created_at,
				startTime: rowData.start,
				endTime: rowData.end
			}
		});
		connection.end();
		return new Bluebird((resolve, reject) => {
			resolve(reservationList);
		});
	})
	.catch((err) => {
		return new Bluebird((resolve, reject) => {
			reject(err);
		});
	});
};

/***
 * Helper to get notified booking data
 * @author Dewangga <dewangga.winardi@gmail.com>
 * @param reservationList
 * @returns {Promise.<TResult>}
 */
exports.getNotificationData = (reservationList) => {
	let connection;
	return mysql.createConnection({
		host     : process.env.NOTIFICATION_DATABASE_HOST,
		user     : process.env.NOTIFICATION_DATABASE_USER,
		password : process.env.NOTIFICATION_DATABASE_PASSWORD,
		database : process.env.NOTIFICATION_DATABASE_DB
	})
	.then((conn) => {
		connection = conn;
		let queryString = 'select * from reservasi where {bookings};';
		queryString = _.replace(queryString, '{bookings}', _.reduce(reservationList, (result, current) => {
			if (result === '') {
				result += 'booking_id=' + current.id;
			} else {
				result += ' or booking_id=' + current.id;
			}
			return result;
		}, ''));
		if (reservationList.length === 0) {
			queryString = 'select * from reservasi where 0;'
		}
		return connection.query(queryString);	
	})
	.then((results) => {			
		return new Bluebird((resolve, reject) => {
			resolve(results);
		});
	})
	.catch((err) => {
		return new Bluebird((resolve, reject) => {
			reject(err);
		});
	});
};

/***
 * Helper to inser notified booking data
 * @author Dewangga <dewangga.winardi@gmail.com>
 * @param reservationList
 * @returns {Promise.<TResult>}
 */
exports.insertNotification = (reservationList) => {
	let connection;
	return mysql.createConnection({
		host     : process.env.NOTIFICATION_DATABASE_HOST,
		user     : process.env.NOTIFICATION_DATABASE_USER,
		password : process.env.NOTIFICATION_DATABASE_PASSWORD,
		database : process.env.NOTIFICATION_DATABASE_DB
	})
	.then((conn) => {
		connection = conn;
		// let queryString = 'select * from reservasi where booking_id=192 or booking_id=102;';	
		let queryString = 'INSERT INTO reservasi (booking_id) VALUES {bookingIds};';
		queryString = _.replace(queryString, '{bookingIds}', _.reduce(reservationList, (result, curr) => {
			if (result !== '') {
				result += ',';
			}
			result+='(';
			result += curr.id;
			result+=')';
			return result;
		}, ''));
		if (reservationList.length === 0) {
			return Bluebird.resolve('Nothing to insert');
		} else {			
			return connection.query(queryString);	
		}
	})
	.then((result) => {
		return new Bluebird((resolve, reject) => {
			resolve(result);
		});
	})
	.catch((err) => {
		return new Bluebird((resolve, reject) => {
			reject(err);
		});
	});	
};

/***
 * Helper to send notification to line bot API
 * @author Dewangga <dewangga.winardi@gmail.com>
 * @param message
 * @returns {Promise.<TResult>}
 */
exports.sendLineNotification = (message) => {
	const options = {
		url: process.env.LINE_BOT_API,
		method: 'POST',
		headers: {
			Authorization: process.env.LINE_BOT_TOKEN
		},
		formData: { 
			message: message
		}		
	};
	return request(options)
		.then((res) => {
			console.log(res);
			return Bluebird.resolve(res.body);
		});
};