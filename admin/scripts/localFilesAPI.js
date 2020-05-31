/**
 * This class is designed for site offline mode.
 * Files are created using file system
 */
function localFilesAPI (loginParams, onSuccess, onFailure) {

  let apiRefferance = this;
  onSuccess(apiRefferance);

  /**
   * Todo: better support blob for binary files 
   */
  this.commitChanges = async function( commitMessage, files ) {

    return  Promise.all(
                    files.map( fileData => {
                      var a = document.createElement("a");
                      var file = new Blob(fileData.content, {type:'text/plain'});
                      a.href = URL.createObjectURL(fileData.filePath );
                      a.download = fileName;
                      a.click();
                    })
                  );
    
  }
}