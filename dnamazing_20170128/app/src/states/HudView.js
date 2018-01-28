import { _ } from 'underscore';
import $ from 'jquery';
import { View } from 'backbone';

const mainTemplate = require('html-loader?root=.!./HudTemplate.html')

// class DiscoveryView extends View {
export default class extends View {
	constructor ({ el, model, state }){
		super({
			el: el, 
			model: model,
			className: "dna-wrapper",
			events: {
				"click #next-style": "nextStyle"
			// 	// "click #user-buttons button": "doMate"
			}
		})

		this.state = state;
		this.template = _.template(mainTemplate);

    	this.render();
	}
	initialize(){
		// this.listenTo(this.model, "change", this.render);
	}
	render(){
		
		var html = this.template({
			"model": this.model
		});
		this.$el.html(html);

		this.$userButtons = this.$el.find("#user-buttons")
		// this.$promptText = this.$el.find(".prompt-text");
    	

		this.$el.find(".sk-cube-grid").addClass("active");

	}


	renderUserButtons(userList){
		this.$userButtons.empty();

		let that = this;

		for(let i = 0;i<userList.length;i++){
			let user = userList[i];
			let newButton = $("<button style=\"background-image: url(" + user.dataUrl + ");\" data-user-id=\"" + user.id + "\" ></button>");
			newButton.on("click", function(){
				// that.doMate();

				// let $currentTarget = $(e.currentTarget);
				// let otherid = $currentTarget.data("user-id");
				window.navigator.vibrate(75);
				that.state.doMate(user.id);

			});
			this.$userButtons.append(newButton);
		}

	}

	// doMate(e){

	// 	e.preventDefault();
		

	// 	let $currentTarget = $(e.currentTarget);
	// 	let otherid = $currentTarget.data("user-id");
	// 	this.state.doMate(otherid);

	// 	return false;
	// }

	nextStyle(e){

		e.preventDefault();
		this.state.setAlgoName();
		return false;

	}
}



