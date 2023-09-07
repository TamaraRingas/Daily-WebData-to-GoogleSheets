# WebData to Google Sheets

Google App script that fetches data from a url, converts it to a string and writes it to a new dated Google Sheet daily at 5pm GMT+2.

## Instructions

Log into your Google account & create a Google Sheet.

Go to `Extensions` => ` AppScript`.

Paste the `code.gs` file contents into the `code.gs` file in the Google-App-Script editor. 

Replace all variables between the `*** ***` characters with your own parameters. 

Click `save` & then under the function drop down select the `createTrigger()` function.

Click `run`, following the promts to allow the app permisions (under "Advanced Settings").

The application will now trigger daily, run the script & create a new dated Google Sheet with the name you supplied. 




