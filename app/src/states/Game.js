/* globals __DEV__ */
import Phaser from 'phaser'
import $ from 'jquery'
import _ from 'underscore'

import HudView from './HudView'

import GenomeData from "../../assets/data/genome"

export default class extends Phaser.State {
  init () {}
  preload () {}
  create () {

    let that = this;
    
    this.maxTreeDepth = 12;

    this.colors=[
      0x709FA0,
      0x452D38,
      0x504458,
      0x606470,
      0x709FA0,
      0xA3B9A3,
      0xEAD3B4,
      0xFAF4EC,
      0xE0B638,
      0xD87E38,
      0xC0522E,
      0xCE4257,
      0x8F454D,
      0xC7E25E,
      0xA5BD66,
      0x638A5C
    ]


    this.maxDepth = null;
    this.calculateMaxDepth();

    this.pollFrequency = 500;

    this.hudView = new HudView({
        "model": null,
        "state": this
    });
    this.$htmlWrapper = $("#html-wrapper");
    this.$htmlWrapper.append(this.hudView.$el);

    this.myId = null;
    localStorage.clear();

    let myIdString = localStorage.getItem("my_id");
    if(myIdString){
      this.myId = parseInt(myIdString);
    }
    
    this.myTreeGroup = game.add.group();
    this.myGenome = null;


    if(this.myId){
      $.ajax({
        "url": "http://35.227.37.79/dnaapi.php?getuser&id="+this.myId,
        "method": "GET",
        "success": function( response ) {
            let parsed = JSON.parse(response);
            that.myGenome = (parsed.genome);

            that.drawMyTree();
        }
      })


    }else{

      // TODO: Tell Jasper to create me
      let myInitialColor = game.rnd.integerInRange(0, this.colors.length-1);

      let myInititalGenomeString = "{\"cc\":" + myInitialColor + "}";


      $.ajax({
        "url": "http://35.227.37.79/dnaapi.php?newuser&numColors="
            +this.colors.length+"&genome=" + encodeURIComponent(myInititalGenomeString),
        // "url": "http://35.227.37.79/api.php",
        "method": "GET",
        "success": function( response ) {
            let parsed = JSON.parse(response);
            that.myId = parsed.id;
            localStorage.setItem("my_id", that.myId)
            that.myGenome = {
              "cc": parsed.cc
            }

            that.drawMyTree();

        }
      })
    }

    this.allUsers = [];

    $(window).resize(function(){
      that.doResize();  
    })


    this.updateThumbsForever();
  }
  render () {}


  updateThumbsForever(){

    let that = this;

    if(this.isBusyThumbnailGetting !== true){

      this.isBusyThumbnailGetting = true;

      $.ajax({
        "url": "http://35.227.37.79/dnaapi.php?getallusers",
        "method": "GET",
        "success": function(response){
          
          that.isBusyThumbnailGetting = false;

          let parsed = JSON.parse(response);

          for(let i = 0;i<parsed.allUsers.length;i++){
            parsed.allUsers[i].genome = JSON.parse(parsed.allUsers[i].genome)
          }

          that.allUsers = null;

          that.allUsers = parsed.allUsers;
          that.createUserButtons(parsed.allUsers);
        }
      })
    
    }

    game.time.events.add(this.pollFrequency, function(){
      this.updateThumbsForever();
    }, this)

  }


  drawTree(node, w, h, x, y, depth, maxDepth, startGroup){

    this.drawingAlgo2(node, w, h, x, y, depth, maxDepth, startGroup)

  }

  drawingAlgo(node, w, h, x, y, depth, maxDepth, startGroup){
    
    if (node == null || typeof(node) === undefined) return;
    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      if (depth % 4 == 0) {
        this.drawTree(node["0"], w,   h/3,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 1) {
        this.drawTree(node["0"], w/3, h,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 2) {
        this.drawTree(node["1"], w,   h/3, x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else {
        this.drawTree(node["1"], w/3, h,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      }

    } else if (typeof(node.cc) !== "undefined") {
      
      let sq = game.add.sprite(x,y,"square");
      sq.tint = this.colors[node.cc]
      sq.width = w;
      sq.height = h;
      startGroup.add(sq);

    }
  }


  drawingAlgo2(node, w, h, x, y, depth, maxDepth, startGroup){
    
    if (node == null || typeof(node) === undefined) return;
    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      if (depth % 2 == 0) {
        this.drawTree(node["0"], w,   h/3,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else {
        this.drawTree(node["0"], w/3, h,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      } 

    } else if (typeof(node.cc) !== "undefined") {
      
      let sq = game.add.sprite(x,y,"square");
      sq.tint = this.colors[node.cc]
      sq.width = w;
      sq.height = h;
      startGroup.add(sq);

    }
  }



  createUserButtons(userList){

    for(let i = 0;i<userList.length;i++){
      
      let g = game.add.group();
      this.drawTree(userList[i].genome, 80, 80, 0, 0, 0, 7, g);
      let tex = g.generateTexture();
      userList[i].dataUrl = tex.getCanvas().toDataURL();
      
      g.destroy();
      tex.destroy();
    }

    this.hudView.renderUserButtons(userList);

  }


  doMate(otherUserId){

    let otherUserData =  _.findWhere(this.allUsers, {id: "" + otherUserId + ""});

    if(otherUserData){


      let newTree = {
        "cc": this.myGenome.cc,
        "1": this.myGenome,
        "0": otherUserData.genome
      };

      let trimmedTree = this.trimTree(newTree, 0);

      this.myGenome = trimmedTree;
      this.myTreeGroup.removeAll();

      // this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.maxDepth, this.myTreeGroup);

      this.drawMyTree();

      let myGenomeString = JSON.stringify(this.myGenome);

      let url = "http://35.227.37.79/dnaapi.php"

      $.ajax({
        "url": url,
        "method": "POST",
        "data": {
          "setuser": true,
          "id": this.myId,
          "genome": myGenomeString
        },
        "success": function( response ) {
//          console.log("FINISHED", response)
        }
      })
    }
  }


  drawMyTree(){

    let tempGroup = game.add.group();
    this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.maxDepth, tempGroup);
    let tex = tempGroup.generateTexture();


    tempGroup.destroy();
    let newSprite = game.add.sprite(0,0,tex);

    this.myTreeGroup.destroy();
    
    this.myTreeGroup = game.add.group();
    this.myTreeGroup.add(newSprite);

  }



  trimTree(someTree, depth) {
    
      let newTree = {
          "cc": someTree.cc
      };

      if (depth < this.maxTreeDepth && typeof(someTree["1"]) !== "undefined" 
            && typeof(someTree["0"]) !== "undefined") {
        newTree["1"] = this.trimTree(someTree["1"], depth+1);
        newTree["0"] = this.trimTree(someTree["0"], depth+1);
      }
      
      return newTree;
  }


  doResize(){

    game.scale.setGameSize(window.innerWidth-104, window.innerHeight);
    this.calculateMaxDepth();
    // $("#content").width(game.width-128);
    this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.maxDepth, 
        this.myTreeGroup);
  }


  calculateMaxDepth(){
    let biggest = Math.max(game.width,game.height);
    this.maxDepth = (Math.log(biggest) / Math.log(2)) + 6;
    
    console.log("max screen size, maxDepth, maxTreeDepth = ", biggest, 
        this.maxDepth, this.maxTreeDepth);
  }
}
