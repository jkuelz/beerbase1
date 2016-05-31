'use strict';

Parse.initialize("RfjfDoUdr2qAKYuN0oTStYN89S8O23Wqoxg4F6EQ", "UPQIStiFfFgKd7RBWZyXfFvuAJ9wUrwkOKDSvX61");

$(document).ready(function() {

	$('#star').raty();	
	var Reviews = Parse.Object.extend("Reviews");

	var reviewID;
	var totalReviews = 0;
	var totalRating = 0;

	// sets and saves to parse when submit button is clicked
	$('#reviewForm').on('submit', function(event) {
		var myReview = new Reviews();
		var reviewTitle = $('#reviewTitle').val();
		var reviewBody = $('#reviewBody').val();
		var userRating = $('#star').raty('score');
		
		myReview.set("reviewTitle", reviewTitle);
		myReview.set("reviewBody", reviewBody);
		myReview.set("starRating", parseInt(userRating, 10));
		myReview.set("helpful", 0);
		myReview.set("total", 0);

		myReview.save(null, {
  			success: function() {
  				console.log('New object created with objectId: ' + myReview.id);
		 	},
		  	error: function(myReview, error) {
		    	console.log('Failed to create new object, with error code: ' + error.message);
		  	}
		}).then(addReview(myReview));
		$('#reviewForm').each(function() {
			this.reset();
		});
		$('#star').raty('score', 0);

		event.preventDefault();
		event.returnValue = false;
		return false;
	});

	// sorts through the old reviews to look at individual components
		var query = new Parse.Query(Reviews);
		query.ascending("createdAt");
		query.find({
			success: function(data) {
			    for (var i = 0; i < data.length; i++) {
					var dataItem = data[i];
			      	var reviewID = dataItem.id;
					var rating = dataItem.get('starRating');
			      	var helpful = dataItem.get('helpful');
			      	var total = dataItem.get('total');
			      	totalRating += rating;
			      	totalReviews++;
			      	addReview(dataItem);
				}
				var avgRating = Math.round(totalRating / totalReviews);
				$('#avg-stars').raty({ readOnly: true, score: avgRating});
			},
			error: function(error) {
			    console.log(error.message);
			}
		});	

	// adds the old reviews to the page
	var addReview = function(dataItem) {
		var rating = dataItem.get('starRating');
		var title = dataItem.get('reviewTitle');
		var content = dataItem.get('reviewBody');
		var reviewID = dataItem.get('objectId');
		var helpful = dataItem.get('helpful');
		var total = dataItem.get('total');
		var oneReview = $('<div/>', {class: 'prevReview', id: reviewID});
		$('<i/>', {class: 'thumbUp fa fa-thumbs-o-up', id: reviewID}).appendTo(oneReview);
		$('<i/>', {class: 'thumbDown fa fa-thumbs-o-down', id: reviewID}).appendTo(oneReview);
		$('<i/>', {class: 'trash fa fa-trash', id: dataItem.id}).appendTo(oneReview);
		var oneTitle = $('<h3/>', {text: title}).appendTo(oneReview);
		var oneRating = $('<div/>', {class: 'stars'});
		oneRating.raty({readOnly: true, score: rating});
		oneRating.appendTo(oneReview);
		var oneBody = $('<p/>', {text: content, id: 'review-content'}).appendTo(oneReview);
		var foundHelpful = $('<p/>', {text: helpful + " out of " + total + " found this review helpful", id: 'found-helpful'}).appendTo(oneReview);
		$('#oldReviews').prepend(oneReview);

		// if trash is clicked, delete review
	    $('.trash').on('click', function() {
	      $('#' + dataItem.id).hide();
	      query.get(dataItem.id, {
	      	success: function(myReview) {
	      		myReview.destroy();
	      	}, error: function(object, error) {
	      		console.log(error.message);
	      	}
	      });
	    });

	    // count thumb ups
		$('.thumbUp').on ('click', function() {
			var query = new Parse.Query('Reviews');
			query.get(dataItem.id, {
				success: function(myReview) {
					myReview.increment("total");
					myReview.increment("helpful");
					myReview.save();
				}
			});
		});

		// count thumb downs in total
		$('.thumbDown').on('click', function() {
			var query = new Parse.Query('Reviews');
			query.get(dataItem.id, {
				success: function(myReview) {
			 		myReview.increment('total');
			 		myReview.save();
			 	}
			});
		});
	}
});


