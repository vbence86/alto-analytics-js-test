# alto-analytics-js-test

=======================================================
 Task: Options selector with YouTube-like progress bar
=======================================================

## Preliminary:

- go to youtube.com and see the 'red progress bar' at the top of a page, which is running from left to right whenever any video/link is chosen. We refer to this progress bar in the rest of the document as YTlike progress bar.


## Description:

Please write a single HTML page which has the following functionality.

- page always adjusts to a size of a browser window (fully filling it up - width and height - with minimal width fixed to 400px and minimal height fixed to 300px)
- page is split to a 'top toolbar' (where 'options' are displayed) and 'content' (rest of the page)
- the 'top toolbar' is at least 50px high and is split into 4 equal parts called 'option placeholders' (boxes - side by side - whole boxes clickable)

 +-------+-------+-------+-------+
 |  All  | Opt1* | Opt2  | Opt3  |
 +=======+===----+-------+-------|
 |                               |
 |                               |
 |      Currently selected:      |
 |       > Opt 1, Opt 3 <        |
 |                               |
 |                               |
 +-------------------------------+
 
- the 4 'option placeholders' for options on top of a page behave as follows:
-- 'All' option is selected by default
-- 'All' option is exclusive to other options but other options are not exclusive to themselves and behave like 'toggle options' (if one is selected it can be unselected and vice versa)
-- always at least one option must be selected (either 'All' or any combination of other options - e.g. Opt2 or Opt1+Opt3 or Opt1+Opt2+Opt3 etc)
-- selecting any of other options shall automatically deselect 'All' option
-- selecting 'All' option shall automatically (if not selected currently) deselect all other options
-- current selection state (if option is selected) is represented by making the option text bold/underlined (at least) and this selection state is updated immediately after the option is clicked (so user gets immediate feedback of what options are selected - waiting only for a delayed update of the 'contents' part of the page)
- whenever options selection state is changed the 'content' of a page gets updated with the current state of selection (update of 'content' is delayed - with the progress bar being played during the delay)
-- the 'content' is updated NOT IMMEDIATELY - but with a delay of 3 seconds - in which time a YTlike progress bar is run from left to right (effectively it means that during the run of the progress bar the selected options can be freely changed - with each change resetting the progressbar)
-- whenever options state is changed by user during the running of the progress bar, current run of a progress bar is reset and starts countdown again (for the updated options selection, only if it actually changed) - this shall allow the user to e.g. quickly jump from 'All' selection to 'Opt1+Opt2' selection (user clicks 'Opt1' then on 'Opt2' /before progressbar started for 'Opt1' click finishes/ - both options are selected now and progress bar is relaunched - finally content is updated with 'Opt1+Opt2')
- the YTlike progress bar (the "=" character on the example layout above) runs just below the 'option placeholders'
- count and values of active options is configurable by page url 'hash'. E.g. adding "#red|green|blue|cyan|magenta" to page url will cause the page to have five options, "red", "green", "blue", "cyan" and "magenta"
-- the default options setup is as described above and is used whenever no 'hash' value is added (it is equivalent of having '#Opt1|Opt2|Opt3' hash)
-- minimum of three options is expected always


## Technical details:

- YT-like progress bar does not have to be as fancy as in YouTube - a 3px-high line running (smoothly) from left to right is enough (no 'canvas' and no 'setInterval' shall be used)


## Technical limitations (IMPORTANT):

- only jquery can be used (and linked e.g. from https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js url) as an external resource
- the rest shall be implemented using plain html, css, javascript (embedded in the page)
- IMPORTANT: the animation of progress bar shall be implemented purely in javascript (NOT using css transitions and NOT using jQuery.animate() function)
- no html 'tables' shall be used
