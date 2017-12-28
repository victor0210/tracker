## Tracker.js

tracker.js is a samll component for uploading front-end-error.
## Usage
First import tracker.js to head

```javascript
<head>
	<script src="tracker.js" type="text/javascript"></script>
</head>
```

Then init tracker instance in the front of all script

```javascript
<script>
	ErrorTracker.init(opts);
</script>
```

## Options
Options is a json object with these	params	configuration

params | type	|	default	|	description
---- | ---	|	--- |	---
report_url |	String	| null |	report request server url
method |  String	|	post |	report request method
callbackSuccess	|	Function	|	null	|	callback	after	upload	success
callbackFailed	|	Function	|	null	|	callback	after	upload	fail

## Enjoy
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tracker.js</title>
    <script src="tracker.js" type="text/javascript"></script>
</head>
<body>
<script>
    ErrorTracker.init({
        report_url: 'http://www.abc.com'
    });

    var f = window.testErrorTracker();
</script>
</body>
</html>
```
