# Tally sheets

As well as this repo, you will need to also clone the custom_app_commons repository as a sibling to this project.

#Installing dependencies for local developement:
Dependencies - use brew, apt-get or any package manager to install the following dependencies:
- nodejs
- bower
- dhis2 instance to be running on 8080 port.


To install dependencies, use these commands:
- `npm install -g gulp`
- `npm install -g karma-cli`
- `npm install`
- `bower install (inside dependencies folder)`

#Running the app
Run `gulp`. This will start compiling the app and launch it in a browser (localhost:8000). The app will not be usable until logging into DHIS2.
- open a new browser tab to URL locahost:8080, log in to DHIS2
- open a new broswer tab to localhost:8000
- the app should now be running

#Running unit tests
running `gulp test` will start unit tests

#Packaging the app
running `gulp pack` will pack the app as a .zip file, and place it in the target folder

#DHIS data model aspects in the app

##config.CustomAttributes depends on DHIS2 custom attributes  

1. `printFlagUID`: this is a Yes-only custom attribute. It can be associated with datasets and programs. Any datasets or programs that have this attribute set, will be made available for printing in this app. Place the custom attribute ID in the id field, and its associations in associatedWith, as shown in the example below.  

2. `displayOptionUID`: this is an option list custom attribute, and can only be associated with data elements. Note that setting this custom attribute will only affect rendering of data elementsof type option set (rendering of data elements of other types will not be affected).  Currently, this attribute allows three rendering options: NONE, LIST and TEXT. If NONE is selected, the data element will not be shown on the print form. If TEXT is selected, it will be rendered as text. If LIST is selected, it will be rendered as a list. If nothing is selected, the data element will be rendered as a list.  To use this custom attribute, place its ID in the id field (Fth2lxGOF4M in the example), its associations in associatedWith (dataElement in the example), and assign each option's code to the options list (0, 1, 2 in the example).  

#####Example:
```javascript
printFlagUID: {
 id: "F6S3pRyjnSf",
 associatedWith: ['dataSet', 'program']
}
displayOptionUID: {
  id: "Fth2lxGOF4M",
  associatedWith: ['dataElement'],
  options: {
    none: '0',
    text: '1',
    list: '2'
  }
}
```


#Config
Tallysheets app has config files in the `src/config` directory.

1. Config.js
2. BootConfig.js  

##Config.js
The configuration options are explained below.

1. `PageTypes`: page types that app supports.
  2. `A4`: contains configuration options for A4 sheets
    3. `Portrait`: contains config for Portrait mode of A4 sheet
      1. `height`: Do not change this value; this denotes the height (length) of the piece of paper on which content is printed.
      2. `width`: Do not change this value; this denotes the width of the piece of paper on which content is printed.
      3. `borderTop`, `borderBottom`, `borderLeft`, `borderRight`: these are, respectively, the top, bottom, left, and right, printing margins. These values are set by the browser. They need to be declared manually here because we cannot derive them from the browser. Do not decrease these values below 15 mm. 
      4. `availableHeight`, `availableWidth`: height (length) and width of printable page area. Changing these values will not affect printouts, as the actual printable area is calculated by the app using the calculatedConfig section, explained below. These values are listed in this configuration section for completion only, to keep all A4 related config keys together. 
    2. `LandScape`: configuration for landscape mode of A4 sheets, same configuration keys are used as per Portrait mode.
2. `Register`: this will contain config related to printing register sheets.
  1. `labelHeight`: height (length) of table column labels.
  2. `dataEntryRowHeight`: table row height (length).
  3. `headerHeight`: height (length) of page header.
  4. `textElementWidth`: width of columns containing data elements of type text.
  5. `otherElementWidth`: width of columns containing data elements of all other types (e.g. option sets, number).
3. `Coversheet`: config related to printing patient file cover sheets
  1. `defaultHeightOfDataElementLabel`: displayed height of a data element field if rendering us used. This rendering is in two columns, and allows the user to fill in each data element in free text.
  2. `gapBetweenSections`: white space left between two adjacent sections on a page.
  3. `heightOfSectionTitle`: height (length) of section titles, present at the top of each new section. 
  4. `heightOfProgramTitle`: height (length) of program title, present at the top of each new page.
  5. `graceHeight`: If the content to be printed is greater than a single page, and the spillover is under the grace height, then the page printable area will increase by the grace height to accommodate the spillover. Practice caution when editing this value, as the grace height increase causes equivalent decreases in the print margins. Maximum value is 10 mm. 
4. `DataSet`: configuration options for printing tally sheets
  1. `heightOfTableHeader`: height (length) of table column label row, when data elements are rendered as CatCombs (category combinations) .
  2. `heightOfDataElementInCatCombTable`: height (length) of rows rendered as CatCombs
  3. `defaultHeightOfDataElementLabel`: height (length) of data element when data elements are rendered as default. This rendering is in two columns, allowing the user to fill in each data element in free text.
  4. `heightOfSectionTitle`: height (length) of section titles, present at the top of each new section. 
  5. `heightOfDataSetTitle`: height (length)  of data set titles, present at the start of each data set and at start of each page.
  6. `gapBetweenSections`: white space left between two adjacent sections on a page.
  7. `headerHeight`: height (length) of the page header.
  8. `numberofCOCColumns`: the number of columns rendered in each row when data elements are rendered as CatCombs. 
5. `CodeSheet`: config related to explainer sheet
  1. `heightOfProgramTitle`: height (length) of program title present at top of the sheet
	2. `rowHeight`: height (length) of each row
	3. `numberOfColumns`: number of columns to fit in a page.
6. `OptionSet`: configuration related to rendering option sets, in both tally sheets and cover sheets (note: changing the values of labelPadding and dataElementLabel will not affect printing, as these options will not come into use until JSS is introduced).
  1. `labelPadding`: the gap between the checkbox and the option name (option label)
  2. `dataElementLabel`: the space (width) assigned for data element names. Longer names without spaces will not word wrap.
  3. `numberOfColumns`: the number of columns for displaying options in an option set.
7. `Prefixes`: Prefixes can be added to any objects, for example printable form types, section names, or options sets. All prefixes usd in this app are configured here. Value keys contain the prefix values; the translationKey has to be the same as what is set in the i18n files.
  1. `dataSetPrefix`: prefix for each data set, prepended to the data set name, seen in the template selection dropdown box.
  2. `programPrefix`: prefix for each program, prepended to the program name, seen in the template selection dropdown box.
8. `Delimiters`: contains all usable delimiters. Any number of white spaces may be added around delimiters during configuration as these will be trimmed by the app.
  1. `OptionLabelDelimiter`: separates the option code from the option label, In the following example, closing square brace ']' is the delimiter, and the app would only display the LABEL.  
  
#####Example:
Each of the following examples will be considered valid by the app  
[CODE]LABEL  
[  CODE  ]               LABEL  
[  CODE] LABEL    

#Calculated Config:
some parts of config is calculated when the app starts. So, this part will contain the formulae in order to calculate the values. This part is present at the end of config.js
####Example:
```javascript
var updateDataSetWithCalculatedValues = function(){
	config.DataSet.availableHeight = config.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders - config.DataSet.headerHeight;
};
```
