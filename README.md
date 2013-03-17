-------------------------------------------------------------------------

BigUpload 

version 1.0.1    
Created by: Sean Thielen <sean@p27.us>

-------------------------------------------------------------------------

BigUpload is a tool for handling large file uploads (tested up to 2GB) through the browser.

![Screenshot](http://i.imgur.com/vESk5dp.png)

-------------------------------------------------------------------------

It uses the HTML5 FileReader library to split large files into manageable chunks,
and then sends these chunks to the server one at a time using an XmlHttpRequest.

The php script then pieces these chunks together into one large file.

Because the chunks are all the same size, it is easy to calculate an accurate progress bar
and a fairly accurate time remaining variable.

This tool is capable of handling file uploads of up to 2GB in size, without the need to tweak
the max_upload and timeout variables on your httpd.

If you want to deploy this as-is, the variables you need to worry about are in the top of    
	* index.html (for js variables)    
	* inc/bigUpload.php (for the folder paths--make sure they're writable)


Please feel free to contribute!

-------------------------------------------------------------------------

v 1.0.1    
*Added time remaining calculator    
*Response from php script is now a json object, allowing for error processing    
*Minor script changes and bugfixes    
*Better comments

v 1.0.0    
*Initial version