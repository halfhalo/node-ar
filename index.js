var _=require("underscore");
var Ar=require("./lib/archive")
var prettyjson=require("prettyjson")
var lib=function(path)
{
	this.path=path;
	this.archive=new Ar(path);

}
lib.prototype.load=function(callback)
{
	this.archive.load(function(err,archive){
		//console.log(prettyjson.render(archive))
		archive.getFiles(function(err,files){
			files[files.length-1].grab(function(err,data){
				console.log(err)
				console.log(data)
			})
		})
	})
}

//(function(next){}(function(){}))
///^([^\s]*)([\s]*)([\d]*)([\s]*)([\d]*)([\s]*)([\d]*)([\s]*)([\d]*)([\s]*)([\d]*)([\s]*)`\n([\S\s]*)/
module.exports=lib;