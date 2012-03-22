var lib={};
lib.parseHeader=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()

	callback(null,{});
}
lib._isFileHeader=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()
	var res=/([^\s]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)(?:[\s]*)`\n/.test(data)
	//console.log(data.match(/([^\s]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)(?:[\s]*)`\n/))
	if(callback)
		callback(res)
	return res;
}
lib._parseFileHeader=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()
	var match=data.match(/([^\s]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)([\d]+)(?:[\s]*)(?:[\s]*)`\n/);
	if(match)
	{
		var obj={"name":null,"size":0,"owner":null,"group":null,"mode":null,"size":null,"extended":false};
		if(match[1].match(/\/([^\/]+)/))
		{
			obj.extended=true;
			obj.extendedName="";
			obj.name=match[1].match(/\/([^\/]+)/)[1];
		}
		else if(/([^\/]+)\//.test(match[1]))
		{
			obj.name=match[1].match(/([^\/]+)\//)[1]
		}
		obj.size=parseInt(match[2],10);
		obj.owner=parseInt(match[3],10);
		obj.group=parseInt(match[4],10)
		obj.mode=parseInt(match[5],10);
		obj.size=parseInt(match[6],10);
		callback(null,obj)
	}
	else
	{
		callback(new Error("invalid file header format"));
	}
}
lib._isExtendedHeader=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()
	var res= /\/\/([\s]*)([\d]*)([\s]*)`\n/.test(data);
	if(callback)
		callback(res)
	return res;
}
lib._parseExtendedHeader=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()
	var files=[];
	var split=data.split("/\n");
	var pos=0;
	for(var i=0;i<split.length;i++)
	{
		if(split[i].length>0)
		{
			files.push({"extendedName":split[i],"name":"/"+pos})
			pos+=split[i].length+"/\n".length
		}
		else
		{

		}
	}
	callback(null,files)
}
lib._getExtendedHeaderLength=function(data,callback)
{
	if(typeof data=="object")
	data=data.toString()
	var match=data.match(/\/\/([\s]*)([\d]*)([\s]*)`\n/);
	if(match)
	{
		callback(null,parseInt(match[2],10))
	}
	else
	{
		callback(new Error("not an extended header"))
	}
	
}
module.exports=lib;