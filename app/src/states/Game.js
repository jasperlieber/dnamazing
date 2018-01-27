/* globals __DEV__ */
import Phaser from 'phaser'
import $ from 'jquery'
import _ from 'underscore'

import HudView from './HudView'

import GenomeData from "../../assets/data/genome"

export default class extends Phaser.State {
  init () {

  }
  preload () {}
  create () {

    let that = this;

    this.colors=[0xcc3333, 0x999933, 0x3333cc, 0x33cc33]

    this.hudView = new HudView({
        "model": null,
        "state": this
    });
    this.$htmlWrapper = $("#html-wrapper");
    this.$htmlWrapper.append(this.hudView.$el);

    this.myId = null;
    // localStorage.clear();

    let myIdString = localStorage.getItem("my_id");
    if(myIdString){
      this.myId = parseInt(myIdString);
    }
    
    this.myTreeGroup = game.add.group();
    this.myGenome = null;


    if(this.myId){
      console.log("MY ID FOUND");
      console.log(this.myId);
      $.ajax({
        "url": "http://35.227.37.79/dna.php?getuser&id="+this.myId,
        "method": "GET",
        "success": function( response ) {
            let parsed = JSON.parse(response);
            console.log(parsed);
            that.myTreeGroup = game.add.group();
            that.myGenome = (parsed.genome);

            that.drawTree(that.myGenome, game.width, game.height, 0, 0, 0, that.myTreeGroup);
        }
      })


    }else{

      // TODO: Tell Jasper to create me
      let myInitialColor = game.rnd.integerInRange(0, this.colors.length-1);

      let myInititalGenomeString = "{\"color\":" + myInitialColor + "}";
      $.ajax({
        "url": "http://35.227.37.79/dna.php?newuser&genome=" + encodeURIComponent(myInititalGenomeString),
        // "url": "http://35.227.37.79/api.php",
        "method": "GET",
        "success": function( response ) {
            let parsed = JSON.parse(response);
            that.myId = parsed.id;

            localStorage.setItem("my_id", that.myId)
            that.myTreeGroup = game.add.group();

            that.myGenome = JSON.parse(myInititalGenomeString);
            
            that.drawTree(that.myGenome, game.width, game.height, 0, 0, 0, that.myTreeGroup);
        }
      })

    }



    this.allUsers = [];


    $.ajax({
      "url": "http://35.227.37.79/dna.php?getallusers",
      "method": "GET",
      "success": function(response){
        
        let parsed = JSON.parse(response);

        for(let i = 0;i<parsed.allUsers.length;i++){
          parsed.allUsers[i].genome = JSON.parse(parsed.allUsers[i].genome)
        }
        that.allUsers = parsed.allUsers;
        that.createUserButtons(parsed.allUsers);

      }
    })


  }
  render () {}


  drawTree(node, w, h, x, y, depth, startGroup){

    if(typeof(node.color) !== "undefined"){

      let sq = game.add.sprite(x,y,"square");
      sq.tint = this.colors[node.color]
      sq.width = w;
      sq.height = h;
      startGroup.add(sq);

    }else if( typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      if(depth%2===0){
        this.drawTree(node["0"], w, h/2, x, y, depth+1, startGroup);
        this.drawTree(node["1"], w, h/2, x, y + (h/2), depth+1, startGroup);
      }else{
        this.drawTree(node["0"], w/2, h, x, y, depth+1, startGroup);
        this.drawTree(node["1"], w/2, h, x + (w/2), y, depth+1, startGroup);
      }

    }

  }

  createUserButtons(userList){

    for(let i = 0;i<userList.length;i++){
      let g = game.add.group();
      this.drawTree(userList[i].genome, 512, 512, 0, 0, 0, g);
      let tex = g.generateTexture();
      userList[i].dataUrl = tex.getCanvas().toDataURL();
      g.destroy();
    }

    this.hudView.renderUserButtons(userList);


  }


  doMate(otherUserId){





    let otherUserData =  _.findWhere(this.allUsers, {id: "" + otherUserId + ""});

    if(otherUserData){

      let newTree = {
        "0": this.myGenome,
        "1": otherUserData.genome
      };

      this.myGenome = newTree;
      this.myTreeGroup.removeAll();

      this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.myTreeGroup);

      let myGenomeString = JSON.stringify(this.myGenome);

      let url = "http://35.227.37.79/dna.php"

      $.ajax({
        "url": url,
        "method": "POST",
        "data": {
          "setuser": true,
          "id": this.myId,
          "genome": myGenomeString
        },
        "success": function( response ) {
          console.log("FINISHED")
        }
      })



    }


  }





}
