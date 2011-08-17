
<pre>$ git clone git@github.com:rflynn/postload.git</pre>

#PostLoad
## Prioritize/schedule page asset loading.
### Improve responsiveness of core elements over secondary and third-party components.

Author: Ryan Flynn <parseerror@gmail.com>

Requirements: jQuery

Browser Compatibility:
* Internet Explorer 8+
* FireFox 5+
* Chrome

Barebones Example:

```
<html>
<head>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script type="text/javascript" src="postload.js"></script>
</head>
<body>
	<img postload-src="foo.jpg">
	<script>
	$(document).ready(function()
	{
		PostLoad.run();
	});
	</script>
</body>
</html>
```

