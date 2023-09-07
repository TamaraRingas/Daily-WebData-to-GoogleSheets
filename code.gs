// Application constants
const APP_TITLE = 'Web Data Handler'; // Application name
const APP_FOLDER = 'Data Handling'; // Application primary folder
const SOURCE_FOLDER = 'Inbound CSV Files'; // Folder for the update files.
const SHEET_REPORT_NAME = '***Sheet Name***'; // Name of destination spreadsheet.

// Application settings
const CSV_HEADER_EXIST = true;  // Set to true if CSV files have a header row, false if not.

const HANDLER_FUNCTION = 'processData'; // Function called by installable trigger to run data processing.

function getData() {
  const url = " ***URL*** ";
  const response = UrlFetchApp.fetch(url);
  return response;
}

function createTrigger() {

  // Checks for an existing trigger to avoid creating duplicate instances.
  // Removes existing if found.
  const projectTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < projectTriggers.length; i++) {
    if (projectTriggers[i].getHandlerFunction() == HANDLER_FUNCTION) {
      console.log(`Existing trigger with Handler Function of '${HANDLER_FUNCTION}' removed.`);
      ScriptApp.deleteTrigger(projectTriggers[i]);
    }
  }

  // Creates the new trigger.
  let newTrigger = ScriptApp.newTrigger(HANDLER_FUNCTION)
    .timeBased()
    .atHour(17)   // Runs at 5 PM in the time zone of this script.
    .everyDays(1) // Runs once per day.
    .create();
  console.log(`New trigger with Handler Function of '${HANDLER_FUNCTION}' created.`);
}


function processData() {

  // Gets application & supporting folders.
  const folderSource = getFolder_(SOURCE_FOLDER);

  var date = Utilities.formatDate(new Date(), "GMT+2", "dd/MM/yyyy");

  // Gets & processes data
  var inputString = getData().toString();
  var stringArray = inputString.split(" ***Delimiter*** ");

  // Writes data to separate csv files
  for (var i = 0; i < stringArray.length; i++) {
    //Logger.log(stringArray[i]);
    var fileName = " ***Data*** " + i.toString() + ".csv";
    DriveApp.createFile(fileName, stringArray[i]).moveTo(folderSource);
  }

  // Gets all CSV files found in the source folder.
  let cvsFiles = folderSource.getFilesByType(MimeType.CSV); 
  let name = " ***SheetName*** " + date.toString();
  let spreadSheet = SpreadsheetApp.create(name);
  SpreadsheetApp.setActiveSpreadsheet(spreadSheet);
  let n = 0;

  // Iterates through each CSV file.
  while (cvsFiles.hasNext()) {

    let csvFile = cvsFiles.next();

    // Appends the unprocessed CSV data into the Google Sheets spreadsheet.
    let sheet = SpreadsheetApp.setActiveSheet(spreadSheet.getSheets()[0]);
    if (n > 0) {
      sheet = SpreadsheetApp.setActiveSheet(spreadSheet.insertSheet());
    }

    // Parses CSV file into data array.
    let data = Utilities.parseCsv(csvFile.getBlob().getDataAsString());

    // Gets the row and column coordinates for next available range in the spreadsheet. 
    let startRow = 1;
    let startCol = sheet.getLastColumn() + 1;

    // Determines the incoming data size.
    let numRows = data.length;
    let numColumns = data[0].length;

    // Appends data into the sheet.
    sheet.getRange(startRow, startCol, numRows, numColumns).setValues(data);

    // Delete processed file.
    csvFile.setTrashed(true);

    // Logs the successfully processed file to the filesProcessed array.
    console.log(`Successfully processed: ${csvFile.getName()}`);

    // Increments the counter.
    n += 1;
  }

  // Add file editors.
  let editors = ["editor1@gmail.com", "editor2@gmail.com"];
  spreadSheet.addEditors(editors);

  // Add file viewers.
  let viewers = ["viewer1@gmail.com", "viewer2@gmail.com"];
  spreadSheet.addViewers(viewers);

  // Deletes input folder
  folderSource.setTrashed(true);
}


// Helper function.
function getFolder_(folderName) {

  // Iterates subfolders to check if folder already exists.
  const subFolders = DriveApp.getFolders();
  while (subFolders.hasNext()) {
    let folder = subFolders.next();

    // Returns the existing folder if found.
    if (folder.getName() === folderName) {
      return folder;
    }
  }
  // Creates a new folder if one doesn't already exist.
  return DriveApp.createFolder(folderName)
    .setDescription(`Supporting folder created by ${APP_TITLE}.`);
}
