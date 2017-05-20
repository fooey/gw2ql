
require('babel-register');

if (process.env.NODE_ENV === 'production') {
	console.log('enabling newrelic service');
	require('newrelic');
}

require('./server');
