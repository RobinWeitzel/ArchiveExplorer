
function start() {


	//MULTI INBOX COMPARISION
	//Some data
	let data_points = {
		labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		datasets: [
			{
			   name: "menzinger.io", type: "bar", //Broken if the name is too long
			   values: [25, 40, 30, 35, 8, 52, 17]
			},
			{
			   name: "gmail.com", type: "line", //Broken if the name is too long
			   values: [25, 50, 10, 15, 18, 32, 27]
			}
		]
	}

	create_m_i_incoming_chart("#chart_multi_inbox_incoming_amounts", data_points, "Received E-Mails per Account")

	//INTERACTIVE MONTH
	//Generate some data
	data = {
		labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		datasets: [
			{ values: [18, 40, 30, 35, 8, 52, 17, -4, 18, 40, 30, 35, 8, 52, 17, -4, 18, 40, 30, 35, 8, 52, 17, -4, 18, 40, 30, 35, 8, 52, 17, -4]}
		]
	}

	//Pass a callback on select (via keyboard)
	on_change_function = (e) => {
		console.log(e);
		document.getElementById("emails_on_that_day").textContent = "You received " + e.values[0] + " E-Mails on " + e.label;
	}

	create_s_i_activity_interactive_chart("#chart_single_inbox_activity", data, "Interactive Month", on_change_function);
	
	
	//HEATMAPS
	//Generate some data
	data_points = {};
	let start_ms = 1546300800;
	let end_ms = start_ms;
	for(let i = 0; i < 365; i++) {
		data_points[String(end_ms)] = Math.round(Math.random()*100);
		end_ms = end_ms + 86400;
	}
	console.log(data_points)

	//Four types: 	W. Title, W. Legend
	//			W. Title, No Legend
	// 			No Title, No Legend
	// 			No Title, W. Legend

	//Can be used to display a single year
	create_s_i_activity_heatmap("#chart_single_inbox_activity_heatmap_single", data_points, "I'm a single year", true);

	//Or the latter three can be combined to make up a year 
	create_s_i_activity_heatmap("#chart_single_inbox_activity_heatmap_1", data_points, "We are three years", false);
	create_s_i_activity_heatmap("#chart_single_inbox_activity_heatmap_2", data_points, null, false);
	create_s_i_activity_heatmap("#chart_single_inbox_activity_heatmap_3", data_points, null, true);
}

/**
 * Creates a chart with the given data and inserts into the div 
 * @param {String} div_id 
 * @param {JSON Object} data_points of the following format:
 * {
 *		labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
 *		datasets: [
 *			{
 *				name: "Some Data", type: "bar",
 *				values: [25, 40, 30, 35, 8, 52, 17]
 *			},
 *			{
 *				name: "Another Set", type: "line",
 *				values: [25, 50, -10, 15, 18, 32, 27]
 *			}
 *		]
 *	}
 * @param {String} title 
 */
const create_m_i_incoming_chart = (div_id, data_points, title ) => {
	let chart_multi_inbox_incoming_amounts = new frappe.Chart(div_id, {  // or a DOM element,
		title: title,
		data: data_points,
		type: 'axis-mixed', 
		height: 350,
		colors: ['#7cd6fd', '#743ee2']
	});
	return chart_multi_inbox_incoming_amounts;
}


/**
 * Creates a chart with the given data and inserts into the div 
 * @param {String} div_id 
 * @param {JSON Object} data_points of the following format:
 * 	{
		labels: ["Sun", "Mon", "Tue"],
		datasets: [
			{values: [18, 40, 30]}
		]
	}
 * @param {String} title 
 * @param {Function} on_change_function 
 */
const create_s_i_activity_interactive_chart = (div_id, data_points, title, on_change_function) => {
	     let chart_single_inbox_activity = new frappe.Chart( div_id, {
	          data: data_points,
	          title: title,
	          type: 'bar',
	          height: 140,
	          colors: ['blue'],
	          isNavigable: true // default: false
	      });
	      chart_single_inbox_activity.parent.addEventListener('data-select', on_change_function);
	      return chart_single_inbox_activity;
	}
	

/**
*Returns the value of a query parameter or false, if none was found
*@param {String} div_id 	The name of div to insert the chart in
*@param {String} data_points The datapoints as a JSON Object of the following format:
*						{
*							'1546300800': 8,
*							...
*							'1546400800': 1
*						}
*					    Warning: must be within one year, otherwise throws an error.
*@param {String} title The name of div to insert the chart in
*@returns {String} chart
**/
const create_s_i_activity_heatmap = (div_id, data_points, title, show_legend) => {

	//Check the timespan for validity (must be in the same year)
	const arr = Object.keys( data_points ).map(function ( key ) { return parseInt(key); });
	const start_year = new Date(Math.min(...arr)*1000).getFullYear()
	const end_year = new Date(Math.max(...arr)*1000).getFullYear()
	if(end_year !== start_year) {
		throw new Error("Data Points must be within a year. Please split into seperate plots.");
	}

	//Check if there is a title
	let has_title = true;
	if(title === null || title === undefined || title === "") {
		has_title = false;
	}

	//Adjust the height, depending on 
	let height = 200;
	if(has_title && show_legend) {
		height = 200;
	}else if(has_title) {
		height = 150;
	}else if(show_legend) {
		height = 180;
	}else {
		height = 130;
	}

	//If the legend shouldn't be shown, hide it
	if(!show_legend) {
		document.getElementById(div_id.replace("#","")).classList.add("no-legend");
	}

	//Create the chart
	let chart = new frappe.Chart(div_id, {
		type: 'heatmap',
		title: title,
		height: height,
		data: {
			dataPoints: data_points,
			start: new Date(String(start_year)),
			end: new Date(new Date(String(start_year)).getFullYear(), 11, 31)
		},
		countLabel: 'Level',
		discreteDomains: 1,
		colors: ['#ebedf0', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e']
	});
	return chart;
}
