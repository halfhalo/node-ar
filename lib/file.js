var fs=require('fs');
var lib=function(path,info)
{
	this.path=path;
	this.extended=info.extended||false;
	if(this.extended)
		this.extendedName=info.extendedName||info.name
	this.name=info.name || null;
	this.start=info.start || null;
	this.owner=info.owner || null;
	this.group=info.group || null;
	this.mode=info.mode || null;
	this.size=info.size||null;
}
lib.prototype._fd=null;
lib.prototype.grab=function(callback)
{
	var self=this;
	this._open(function(){
		self._read(function(err,data){
			if(err)
			console.log(err)
			console.log(data.toString())
		})
	})
}
lib.prototype._open=function(callback)
{
	var self=this;
	if(this._fd)
	{
		callback(null,this._fd);
	}
	else
	{
		fs.open(this.path, "r",function(err,fd){
			self._fd=fd
			callback(err,fd)
		})
	}
}
lib.prototype._read=function(callback)
{
	var self=this;
	if(!this._fd)
		callback(new Error("No File Open"))
	else
	{
		var newBuffer=new Buffer(this.size);
		fs.read(this._fd, newBuffer, 0, this.size, this.start, function(err,bytesread,buff){
			if(bytesread==self.size)
				callback(err,buff)
			else
				callback(err||new Error("bytes read does not match file size"));
		})
	}
}
module.exports=lib;