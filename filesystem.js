
/* Run on load. */
$(document).ready(function() {
	
	/* File system features. */
	var fs = (function() {
		var $fs,
			$lastFile = 'lastFile',
			$lastFileMimeType = 'text/plain',
			
			/* Save filesystem. */
			init = function(filesystem) {
				$fs = filesystem;
				
				/* Load last file. */
				openFile($lastFile, function(fl, contentl) {
					openFile(contentl, function(f, content, type) {
						jQuery('#content').val(content);
						jQuery('#filename').val(f);
						jQuery('#type').val(type);
						jQuery('#status').html(f + ' restored');
						});
				}, undefined, false);
			},
			
			errorHandler = function(e) {
				var msg = '';
				
				switch(e.code) {
				  case FileError.QUOTA_EXCEEDED_ERR:
					msg = 'QUOTA_EXCEEDED_ERR';
					break;
				  case FileError.NOT_FOUND_ERR:
					msg = 'NOT_FOUND_ERR';
					break;
				  case FileError.SECURITY_ERR:
					msg = 'SECURITY_ERR';
					break;
				  case FileError.INVALID_MODIFICATION_ERR:
					msg = 'INVALID_MODIFICATION_ERR';
					break;
				  case FileError.INVALID_STATE_ERR:
					msg = 'INVALID_STATE_ERR';
					break;
				  default:
					msg = 'Unknown Error';
					break;
				};
				
				console.log('Error: ' + msg);				
			},
			
			setLastFile = function(filename) {
				saveFile($lastFile, $lastFileMimeType, filename, undefined, undefined, false);
			},
			
			/* Save file to persistent storage. */
			saveFile = function(filename, type, content, success, error, setLast) {
				$fs.root.getFile(filename, 
					{ create: false, exclusive: false },
					function(fileEntry) {
						fileEntry.createWriter(function(fileWriter){
							fileWriter.onwriteend = function() {
								fileWriter.onwriteend = function() {
									
									if( setLast === undefined ) {
										setLastFile(filename);
									}
									
									if( success !== undefined ) {
										success(filename);
									}
								};
								
								fileWriter.write(bb.getBlob(type));
							};
							fileWriter.onerror = function() {
								if( error !== undefined ) {
									error(filename);
								}
							};
							
							var bb = new window.WebKitBlobBuilder();
							bb.append(content);
							fileWriter.truncate(0);					
						}, errorHandler);
					}, errorHandler);
			},
			
			/* Open file to persistent storage. */
			openFile = function(filename, success, error, setLast) {
				$fs.root.getFile(filename, 
					{ create: true, exclusive: false },
					function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							
							reader.onprogress = function() {
								var a = "debug";
							};
							
							reader.onerror = function() {
								if( error !== undefined ) {
									error(filename);
								}
							};
							
							reader.onloadend = function(e) {
								if( setLast === undefined ) {
									setLastFile(filename);
								}
								
								if( success !== undefined ) {
									success(filename, this.result, file.type);
								}
							};

							reader.readAsText(file);
						}, errorHandler);
					}, errorHandler);				
			};
			
		/* Initialise filesystem */
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(window.PERSISTENT, 1000000, init, errorHandler);
		
		return { saveFile : saveFile,
				 openFile : openFile };
	})();
	
	jQuery('#openBtn').click(
		function openBtn() {
			fs.openFile(jQuery('#filename').val(),
				function(f, content, type) {
					jQuery('#content').val(content);
					jQuery('#type').val(type);
					jQuery('#status').html(f + ' opened');
				},
				function(f) {
					jQuery('#status').html(f + ' open failed');
				});
		});	

	jQuery('#saveBtn').click(
		function () {
			fs.saveFile(jQuery('#filename').val(),
				jQuery('#type').val(),
				jQuery('#content').val(),
				function(f) {
					jQuery('#status').html(f + ' uploaded');
				},
				function(f) {
					jQuery('#status').html(f + ' upload failed');
				});
		});
});
