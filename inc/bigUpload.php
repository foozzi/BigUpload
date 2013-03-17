<?php
class BigUpload
{
	//Temporary folder for storing uploads
	private $tempDirectory = '../files/tmp/';

	//Final folder for storing uploads
	private $mainDirectory = '../files/';

	public $tmpName = 0;

	//Create a random file name for the file to use as it's being uploaded
	public function createTempName() {
		$this->tmpName = mt_rand() . '';
	}

	//Function to upload the file chunks into the temp folder
	public function uploadFile() {

		//Create a filename if this is the first chunk
		if($this->tmpName == 0) {
			$this->createTempName();
		}

		//Open the raw POST data from php://input
		$fileData = file_get_contents('php://input');

		//Write the actual chunk
		$handle = fopen($this->tempDirectory . $this->tmpName, 'a');
		fwrite($handle, $fileData);
		fclose($handle);

		return $this->tmpName;
	}

	//Function for cancelling uploads while they're in-progress; just deletes the temp file
	public function abortUpload() {
		if(unlink($this->tempDirectory . $this->tmpName)) {
			return true;
		}
		else {
			return 'Unable to delete temporary file.';
		}
	}

	//Function to rename and move the finished file
	public function finishUpload($finalName) {
		if(rename($this->tempDirectory . $this->tmpName, $this->mainDirectory . $finalName)) {
			return 'Success.';
		}
		else {
			return 'Unable to move file after uploading.';
		}
	}
}

$bigUpload = new BigUpload;
$bigUpload->tmpName = (isset($_GET['key'])) ? $_GET['key'] : $_POST['key'];

switch($_GET['action']) {
	case 'upload':
		print $bigUpload->uploadFile();
		break;
	case 'abort':
		print $bigUpload->abortUpload();
		break;
	case 'finish':
		print $bigUpload->finishUpload($_POST['name']);
		break;
}
?>