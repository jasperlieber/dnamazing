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
    
    this.maxTreeDepth = 8;
    this.maxThumbnailDepth = 4;


    this.algoNames = ["drawingAlgo1", "drawingAlgoSquareSpiral", "drawingAlgoSpiral", "drawingAlgoMatt"]
    this.chosenAlgoIndex = 0;
    this.chosenAlgoName = this.algoNames[this.chosenAlgoIndex];

    this.colors=[
      // 0x709FA0,
      0x302D55,
      // 0x504458,
      // 0x606470,
      // 0xA3B9A3,
      // 0xEAD3B4,
      // 0xFAF4EC,
      0xE0B638,
      0xD87E38,
      0xC0522E,
      // 0xCE4257,
      0x8F454D,
      // 0xC7E25E,
      // 0xA5BD66,
      0x89b233
    ]

    this.maxDepth = null;
    this.calculateMaxDepth();

    this.pollFrequency = 1750;

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

            that.updateThumbsForever();


        }
      })


    }else{

      // TODO: Tell Jasper to create me
      let myInitialColor = game.rnd.integerInRange(0, this.colors.length-1);

      let myInititalGenomeString = "{\"cc\":" + myInitialColor + "}";


      $.ajax({
        "url": "http://35.227.37.79/dnaapi.php?newuser&numColors="
            +this.colors.length,
        // "url": "http://35.227.37.79/api.php",
        "method": "GET",
        "success": function( response ) {
            let parsed = JSON.parse(response);
            that.myId = parsed.id;
            localStorage.setItem("my_id", that.myId)
            that.myGenome = {
              "cc": JSON.parse(parsed.cc)
            }

            that.drawMyTree();
            that.updateThumbsForever();

        }
      })
    }

    this.allUsers = [];

    $(window).resize(function(){
      that.doResize();  
    })







    // Show color options
    // let foogroup = game.add.group();
    // for(let i = 0;i<this.colors.length;i++){
    //   let foo = game.add.sprite(i*50, 0, "square");
    //   foo.width = 50;
    //   foo.height = 50;
    //   foo.tint = this.colors[i];
    //   foogroup.add(foo);
    // }



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
          

          console.log("????")


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


    this[this.chosenAlgoName](node, w, h, x, y, depth, maxDepth, startGroup);

    // this.drawingAlgo1(node, w, h, x, y, depth, maxDepth, startGroup);
//  this.drawingAlgoSpiral(node, w, h, x, y, depth, maxDepth, startGroup);

    // this.drawingAlgoMatt(node, w, h, x, y, depth, maxDepth, startGroup);
    
  }



  drawingAlgoMatt(node, w, h, x, y, depth, maxDepth, startGroup){

    if (node == null || typeof(node) === undefined) return;

    let bgSquare = game.add.sprite(x,y, "square");
    bgSquare.width = w;
    bgSquare.height = h;
    bgSquare.tint = this.colors[node.cc];
    startGroup.add(bgSquare);

    let shrinkFactor = .95;

    let next_w = (w/2) * shrinkFactor;
    let next_h = h * shrinkFactor;

    let xOffset = ((1-shrinkFactor)/2) * (w/2);
    let x1 = x + xOffset;
    let x2 = x + (w/2) + xOffset

    let yOffset = ((1-shrinkFactor)/2) * h;
    let y1 = y + yOffset;
    let y2 = y + yOffset;


    if (depth % 2 == 1) {

      next_w = w * shrinkFactor;
      next_h = (h/2) * shrinkFactor;

      xOffset = ((1-shrinkFactor)/2) * (w);
      x1 = x + xOffset;
      x2 = x + xOffset

      yOffset = ((1-shrinkFactor)/2) * (h/2);
      y1 = y + yOffset;
      y2 = y + (h/2) + yOffset;

    }



    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

        this.drawingAlgoMatt(node["0"], next_w, next_h, x1, y1, depth+1, maxDepth, startGroup);
        this.drawingAlgoMatt(node["1"], next_w, next_h, x2, y2, depth+1, maxDepth, startGroup);

    } else if (typeof(node.cc) !== "undefined") {
      
        let sq = game.add.sprite(x,y,"square");
        sq.tint = this.colors[node.cc]
        sq.width = w;
        sq.height = h;
        startGroup.add(sq);

    }

  }


  drawingAlgoSquareSpiral(node, w, h, x, y, depth, maxDepth, startGroup){
    
    if (node == null || typeof(node) === undefined) return;
    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      if (depth % 4 == 0) {
        this.drawTree(node["0"], w,   h/3,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 1) {
        this.drawTree(node["0"], w/3, h,   x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 2) {
        this.drawTree(node["1"], w,   h/3, x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else {
        this.drawTree(node["1"], w/3, h,   x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      }

    } else if (typeof(node.cc) !== "undefined") {
      let fn = "square";
      let sq = game.add.sprite(x,y,fn);
      sq.tint = this.colors[/*typeof(node["1"]) !== "undefined" ? node["0"].cc :*/ node.cc];
      sq.width = w;
      sq.height = h;
      startGroup.add(sq);

    }
  }
  drawingAlgoSpiral(node, w, h, x, y, depth, maxDepth, startGroup){
    
    if (node == null || typeof(node) === undefined) return;
    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      if (depth % 4 == 0) {
        this.drawTree(node["0"], w,   h/3,   x,         y,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 1) {
        this.drawTree(node["0"], w/3, h,   x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      } else if (depth % 4 == 2) {
        this.drawTree(node["1"], w,   h/3, x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w,   h/3*2, x,         y + (h/3),  depth+1, maxDepth, startGroup);
      } else {
        this.drawTree(node["1"], w/3, h,   x,         y,            depth+1, maxDepth, startGroup);
        this.drawTree(node["0"], w/3*2, h,   x + (w/3), y,          depth+1, maxDepth, startGroup);
      }

    } else if (typeof(node.cc) !== "undefined") {
      let fn = "arc" + (depth % 4 + 1);
      let sq = game.add.sprite(x,y,fn);
      sq.tint = this.colors[/*typeof(node["1"]) !== "undefined" ? node["0"].cc :*/ node.cc];
      sq.width = w;
      sq.height = h;
      startGroup.add(sq);

    }
  }


  drawingAlgo1(node, w, h, x, y, depth, maxDepth, startGroup){
    
    if (node == null || typeof(node) === undefined) return;
    
    if( depth <= maxDepth && typeof(node["0"]) !== "undefined" && typeof(node["1"]) !== "undefined" ){

      let b = 0;
      
      // console.log(w-b*2,   h/2-b*2, x+b,         y-b);
      if (depth % 2 == 0) {
        this.drawTree(node["0"], w-b*2,   h/2-b*2, x+b,         y-b,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w-b*2,   h/2-b*2, x+b,         y+h/2-b,      depth+1, maxDepth, startGroup);
      } else {
        this.drawTree(node["0"], w/2-b*2, h-b*2,   x+b,         y-b,          depth+1, maxDepth, startGroup);
        this.drawTree(node["1"], w/2-b*2, h-b*2,   x+w/2+b,     y-b,          depth+1, maxDepth, startGroup);
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
      this.drawTree(userList[i].genome, 80, 80, 0, 0, 0, this.maxThumbnailDepth, g);
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
    this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.maxDepth, 
        tempGroup);
    let tex = tempGroup.generateTexture();

    tempGroup.destroy();
    let newSprite = game.add.sprite(0,0,tex);

    this.myTreeGroup.destroy();
    
    this.myTreeGroup = game.add.group();
    this.myTreeGroup.add(newSprite);


    game.world.sendToBack(this.myTreeGroup);

  }

  trimTree(someTree, depth) {
    
      let newTree = {
          "cc": someTree.cc
      };

      if (depth <= this.maxTreeDepth+1 && typeof(someTree["1"]) !== "undefined" 
            && typeof(someTree["0"]) !== "undefined") {
        newTree["1"] = this.trimTree(someTree["1"], depth+1);
        newTree["0"] = this.trimTree(someTree["0"], depth+1);
      }
      
      return newTree;
  }


  doResize(){

    let rightOffset = 104;
    if(navigator.platform.indexOf('Win') > -1){
      rightOffset = 120;
    }

    game.scale.setGameSize(window.innerWidth-rightOffset, window.innerHeight);
    this.calculateMaxDepth();
    // $("#content").width(game.width-128);
    this.drawTree(this.myGenome, game.width, game.height, 0, 0, 0, this.maxDepth, 
        this.myTreeGroup);
  }


  calculateMaxDepth(){
    let biggest = Math.max(game.width,game.height);
    this.maxDepth = (Math.log(biggest) / Math.log(2)) + 2;
    
//    console.log("max screen size, maxDepth, maxTreeDepth = ", biggest, 
//        this.maxDepth, this.maxTreeDepth);
  }


  setAlgoName(){

    this.chosenAlgoIndex = ( this.chosenAlgoIndex + 1 ) % this.algoNames.length;

    this.chosenAlgoName = this.algoNames[this.chosenAlgoIndex];
    this.drawMyTree();
    this.createUserButtons(this.allUsers);

  }

}
