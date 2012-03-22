var fs=require("fs");
var arEntry=require("./entry");
var arFile=require("./file");
var prettyjson=require("prettyjson")
var _=require("underscore");
var lib=function(path,cb)
{
	this.path=path;
	this.cursor=0;
	this.fd=null;
	this.files=[];
	this.fileStart=0;
	this.fileLength=0;
	this.extended=null;
	return this;

}
lib.prototype.load=function(callback)
{
	var self=this;
	this._open(function(err,fd){
		if(err)
			callback(err)
		else
		self._checkGlobalHeader(function(err,header){
			if(err)
				callback(err)
			else
			{
				if(!header)
				{
					callback(new Error("not a valid ar archive"))
				}
				else
				{
					self._read(60,null,function(err,data){
						(function(next){
							if(!self.extended)
							{
								arEntry._isExtendedHeader(data,function(isHeader){
									if(isHeader)
									{
										arEntry._getExtendedHeaderLength(data,function(err,length){
											self._read(length,null,function(err,data){
												arEntry._parseExtendedHeader(data,function(err,headers){
													self.extended=headers;
													next(err);
												})
											})
										})
									}
									else
									{
										self._moveCursor(-60);
										next();
									}
								})
							}
							else
							{
								self._moveCursor(-60);
							}
						}(function(){
							self.fileStart=self.cursor;
							callback(null,self)
						}))
					})
				}
			}
		})
	})
}
lib.prototype.getFiles=function(callback)
{
	var self=this;
	this.cursor=this.fileStart;
	self._getFiles(null,function(err,files){
		callback(err,files)
	});	
}
lib.prototype._getFiles=function(start,callback)
{
	var self=this;
	var fs=[];
	self._findNextFile(function(err,startByte){
		if(err)
			callback(err);
		else
		{
			if(startByte)
			{
				self._getFile(startByte,function(err,file){
					if(err)
						callback(err)
					else
					{
						fs.push(file);
						self._getFiles(null,function(err,f){

							if(err)
								callback(err)
							else
							{
								if(f)
								{
									_.each(f,function(z){
										fs.push(z)
									})
								}
								callback(err,fs)
							}
						})
					}
				});
			}
			else
			{
				callback(null,null);
			}
		}
	})
}
lib.prototype._getFile=function(start,callback)
{
	var self=this;
	this.cursor=start||this.fileStart;
	this._read(60,null,function(err,data){
		arEntry._isFileHeader(data,function(isHeader){
			(function(next){
				if(isHeader)
				{
					next();
				}
				else
				{
					self._findNextFile(function(err,startByte){
						
					})
				}
			}(function(){
				arEntry._parseFileHeader(data,function(err,file){
					if(err)
						callback(err);
						file.start=self.cursor;
					if(file.extended)
					{
						_.each(self.extended,function(f){
							if(f.name==="/"+file.name)
								file.extendedName=f.extendedName
						})
					}
					var arf=new arFile(self.path,file);
					self.files.push(arf)
					self._moveCursor(arf.size);
					callback(err,arf);
				})
			}))
		})
	})
}
lib.prototype._findNextFile=function(callback,start,hold,datas)
{
	datas=datas||"";
	var self=this;
	//console.log("_findNextFile")
	if(this.cursor%2!=0)
	this.cursor++;
	this._read(60,null,function(err,data){
		arEntry._isFileHeader(datas+data,function(isHeader){
			if(isHeader)
				{
					self._moveCursor(-60);
					callback(null,self.cursor);
				}
				else
				{
					if(data.length>0)
					{
						console.log("Hmmm");
						console.log([data.toString()])
					}
					else
					{
						callback(null,null)
					}

				}
		})
	})
	
}
lib.prototype._checkGlobalHeader=function(callback)
{
	this._read(8,null,function(err,data){
		if(err)
			callback(err)
		else
		{
			if(data.toString()==="!<arch>\n")
				callback(null,true)
			else
				callback(null,false)
		}
	})
}
lib.prototype._moveCursor=function(num){
	this.cursor+=num||0;
}
lib.prototype._open=function(callback)
{
	var self=this;
	if(this.fd)
	{
		callback(null,this.fd);
	}
	else
	{
		fs.open(this.path, "r",function(err,fd){
			self.fd=fd
			callback(err,fd)
		})
	}
}
lib.prototype._read=function(bytes,buffer,callback)
{
	var self=this;
	if(!this.fd)
		callback(new Error("No File Open"))
	else
	{
		bytes=bytes||512;
		buffer=buffer||new Buffer(0);
		var newBuffer=new Buffer(bytes);
		fs.read(this.fd, newBuffer, 0, bytes, this.cursor, function(err,bytesread,buff){
			var retBuffer=new Buffer(bytesread+buffer.length);
			buffer.copy(retBuffer,0,0,buffer.length)
			buff.copy(retBuffer,buffer.length,0,bytesread)
			self.cursor+=bytesread
			callback(err,retBuffer)
		})
	}
}
//(function(next){}(function(){}))
module.exports=lib;