require("dotenv").config();
const mongoose = require("mongoose");

module.exports = () => {
	const user = process.env.MONGO_USER;
	const password = process.env.MONGO_PASSWORD;
	const cluster = process.env.MONGO_CLUSTER;
	const database = process.env.MONGO_DATABASE;

	const uri = `mongodb+srv://${user}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;


	const connection = mongoose
		.connect(uri)
		.then((result) => console.log("Connected to database"))
		.catch((err) => console.log(err));
};