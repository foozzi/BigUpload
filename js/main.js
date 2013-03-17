function bigUpload () {
	//ID of file input element
	this.inputField = 'file';
	this.progressBarField = 'progressBarFilled';
	this.timeRemainingField = 'timeRemaining';
	this.responseField = 'uploadResponse';
	//Size of chunks to upload (in bytes)
	this.chunkSize = 1000000;
	//Max file size allowed
	this.maxFileSize = 1000000000;

	this.aborted = false;
	this.key = 0;
	parent = this;

	this.timeStart = 0;

	//Initial method called
	//Pulls the size of the file being uploaded and calculated the number of chunks, then calls the recursive upload method
	this.processFiles = function() {

		//Reset the background color of the progress bar in case it was changed by any earlier errors
		document.getElementById(this.progressBarField).style.backgroundColor = 'rgb(91, 183, 91)';
		document.getElementById(this.responseField).textContent = '';
		this.timeStart = new Date().getTime();

		this.file = document.getElementById(this.inputField).files[0];
		var fileSize = this.file.size;
		if(fileSize > this.maxFileSize) {
			//this.callError('The file you have chosen is too large.');
			return;
		}
		var numberOfChunks = Math.ceil(fileSize / this.chunkSize);

		this.sendFile(0, numberOfChunks);
	};

	//Main upload method
	this.sendFile = function (chunk, numberOfChunks) {
		//Check if the upload has been cancelled by the user
		if(this.aborted === true) {
			return;
		}

		//Set the byte to start uploading from and the byte to end uploading at
		var start = chunk * this.chunkSize;
		var stop = start + this.chunkSize;
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			//Build the AJAX request
			//this.key is the temporary filename, if the server sees it as 0 it will generate a new filename and pass it back as the responseText, which will update this.key with the new filename to use. When this method sends a valid filename, the server will just append the data being sent to that file.
			xhr = new XMLHttpRequest();
			xhr.open("POST", 'inc/bigUpload.php?action=upload&key=' + parent.key, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var response = JSON.parse(xhr.response);
					if(response.errorStatus !== 0 || xhr.status != 200) {
						//Call the error method
						parent.printResponse(response.errorText, true);
						return;
					}
					if(chunk === 0 || parent.key === 0) {
						//If it's the first chunk, set this.key to the server response
						parent.key = response.key;
					}

					if(chunk < numberOfChunks) {
						//Update the progress bar
						parent.progressUpdate(chunk + 1, numberOfChunks);
						//Run this function again until all chunks are uploaded
						parent.sendFile((chunk + 1), numberOfChunks);
					}
					else {
						//The file is completely uploaded
						parent.sendFileData();
					}

				}

			};
			//Send the file chunk
			xhr.send(blob);
		};

		//Slice the file into the desired chunk
		var blob = this.file.slice(start, stop);
		reader.readAsBinaryString(blob);
	};

	//This method is for whatever housekeeping work needs to be completed after the file is finished uploading. As it's setup now, it passes along the original filename to the server and the server renames the file and removes it form the temp directory.
	this.sendFileData = function() {
		var data = 'key=' + this.key + '&name=' + this.file.name;
		xhr = new XMLHttpRequest();
		xhr.open("POST", 'inc/bigUpload.php?action=finish', true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function() {
				var response = JSON.parse(xhr.response);
				if(response.errorStatus !== 0 || xhr.status != 200) {
					//Call the error method
					parent.printResponse(response.errorText, true);
					return;
				}
				if(xhr.readyState == 4) {
					parent.progressUpdate(1, 1);
					parent.printResponse('File uploaded successfully.', false);
				}

			};
		xhr.send(data);
	};

	//This method cancels the upload of a file. It sets the global variable this.aborted to true, which stops the recursive upload script. The server then removes the incomplete file from the temp directory.
	this.abortFileUpload = function() {
		this.aborted = true;
		var data = 'key=' + this.key;
		xhr = new XMLHttpRequest();
		xhr.open("POST", 'inc/bigUpload.php?action=abort&key=' + this.key, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					var response = JSON.parse(xhr.response);
					if(response.errorStatus !== 0 || xhr.status != 200) {
						//Call the error method
						parent.printResponse(response.errorText, true);
						return;
					}
					parent.printResponse('File upload was cancelled.', true);
				}

			};
		xhr.send(data);
	};

	this.resetKey = function() {
		this.key = 0;
		this.aborted = false;
		this.timeStart = 0;
	};

	//This method updates a simple progress bar.
	this.progressUpdate = function(progress, total) {
		var percent = Math.ceil((progress / total) * 100);
		document.getElementById(this.progressBarField).style.width = percent + '%';
		document.getElementById(this.progressBarField).textContent = percent + '%';

		//Calculate the estimated time remaining
		//Only run this every five chunks, otherwise the time remaining jumps all over the place (see: http://xkcd.com/612/)
		if(progress % 5 === 0) {
			var currentTime = new Date().getTime();
			var timeLeft = Math.ceil((currentTime - (this.timeStart / progress)) * (total - progress) / 10000000000000);

			document.getElementById(this.timeRemainingField).textContent = timeLeft + ' seconds remaining';
			this.timeStart += currentTime;
		}
	};

	this.printResponse = function(responseText, error) {
		document.getElementById(this.responseField).textContent = responseText;
		document.getElementById(this.timeRemainingField).textContent = '';
		if(error === true) {
			document.getElementById(this.progressBarField).style.backgroundColor = 'rgb(218, 79, 73)';
		}
	};
}