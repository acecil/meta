var FS;

function onInitFs(fs) {
	FS = fs;
}

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestFileSystem(window.PERSISTENT, 1000000, onInitFs, errorHandler);

function uploadFile() {
	var filename = jQuery("#filename").val();
	FS.root.getFile(filename, {create: true, exclusive: false}, 
	function(fileEntry) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        jQuery("#status").html(filename + " uploaded");
      };

      fileWriter.onerror = function(e) {
        jQuery("#status").html("Failed to upload" + filename);
      };

      // Create a new Blob and write it to log.txt.
      var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
      bb.append(jQuery("#content").val());
      fileWriter.write(bb.getBlob(jQuery("#type").val()));

    }, errorHandler);
  }, errorHandler);
}

function openFile() {
	var filename = jQuery("#filename").val();
	FS.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
         jQuery("#content").html(this.result);
       };

       reader.readAsText(file);
    }, errorHandler);
	}, errorHandler);
}
