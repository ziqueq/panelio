# PanelIO - Console logging tool
![Status: in-progress](https://img.shields.io/badge/Status-in--progress-green.svg?style=flat-square)

##### Overrides standard console logging and gives you an ability to print data in defined place.

Current functionality presentation:

![Presentation example](http://g.recordit.co/YiSPnQtbba.gif)

#### Planned functionality:
* Proxing default logging (log, info, error) into dedicated cells in template
* Coloring output
* Checking template for errors
* Writing output to file


#### Usage Example
Defining panel template using HTML-like syntax. For example:
```html
<root columnsWidths='50|*|60'>
	<row height='8'>
		<column rowspan='2' padding='0 1' >
			<data name='Seconds' value='seconds' />
			<data name='Char' value='char' />
			<data name='Some log' value='log' />
		</column><column>
		</column>
		<column>
			<data name='Name' value='name' />
		</column>
	</row>
	<row height='3'>
		<column>
			<data name='Test var' value='variable' />
		</column>
		<column></column>
		<column>
            <data name='Static' value='static' />
        </column>
	</row>
	<row height='3'>
		<column colspan='2'>
			<data name='Lipsum' value='lipsum' />
		</column>
		<column colspan='1'></column>
	</row>
	<row height='*'>
		<column colspan='3'></column>
	</row>
</root> 
```

Presentation example:

```javascript
require('./console-prototype.js')(console);

setInterval(function() {
	console.log('date', new Date().toString());
}, 1000);

var k = 0;
setInterval(function() {
    var names = ['Andrew', 'George', 'Alan', 'Joseph', 'Nick'];
	console.log('name', names[k++%names.length]);
}, 500);

var c = 0;
setInterval(function() {
	var t = String.fromCharCode(c+65);
	console.log('char', t);
	if(++c>25) {
		c = 0;
	}
}, 300);

var i = 0;
setInterval(function() {
	i++;
	console.log('variable', i);
}, 50);


setInterval(function() {
	var lipsum = `...lorem ipsum text here...`;
	var size = 300;
	var t = Math.floor(Math.random()*lipsum.length - size);
	var str = lipsum.slice(t, t + size); // Get a chunk of 300 symbols from text
	console.log('lipsum', str);
	console.log('log', str);
}, 2000);

console.log('static', 'Static text here');
```
