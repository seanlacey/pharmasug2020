/*=====================================================================================*
Program Name        : ae_plot_create.sas
Program Language    : SAS Version 9.4M6
Operating System    : Windows 10
________________________________________________________________________________________
Version History     :

Version     Date            Programmer    	Description
-------     ---------       ----------    	-----------
1.0			19NOV2019		Sean Lacey		Program Created
========================================================================================*/

ods html close;
ods listing close;

/********************************************************************************************
Main Program
********************************************************************************************/
***SAS Data Location;
libname dataIn ".\sasdata";

***Declare files to read in;
filename inCSS 'template_directory\style.css' recfm=v lrecl=32767;
filename inHTML 'template_directory\index.html' recfm=v lrecl=32767;
filename inJS 'template_directory\chart.js' recfm=v lrecl=32767;

***Declare Output File;
filename htmlout "aeplot_template_test.html";

***Create Temporary Files for SAS Input;
filename jsondata temp mod;
filename subjOpts temp mod;

***Create JSON Data;
data ae1;
	set dataIn.adae;

	keep usubjid subjid sex age TRT01A TRTSDT TRTEDT AEDECOD AESTDT AESTDY AEENDT AEENDY AEDUR
		 AETOXGRN;
run;

proc JSON out=jsondata pretty;
	export ae1 / keys nosastags;
run;

***Create Subject Options for Select Box;
proc sort data=ae1 out=subjlist(keep=subjid) nodupkey; 
	by subjid; 
run;

data _NULL_;
	length optout $200;
	set subjlist;
	file subjOpts;

	optout=cats("<option value='",subjid,"'>",subjid,"</option>");

	put optout;
run;

***Output file;
proc stream outfile=htmlout resetdelim='_mydelim' quoting=both asis; 
BEGIN
	%include inHTML;
;;;;
run;
