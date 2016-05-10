var PanelTemplateParser = require('./panel-template-parser.js')
var Panel = require('./panel.js')
var templateStr = `
	<root columnsWidths='50|*|60'>
		<row height='8'>
			<column rowspan='2' padding='0 1' >
				<data name='Date' value='date' />
				<data name='Alphabet' value='char' />
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
`;

module.exports = function(console) {
	if(console) {
		var __console = {
			log: console.log.bind(console)
		};

		var template = new PanelTemplateParser(templateStr);
		var panel = new Panel(__console);
		panel.setTemplate(template);

		console.log = function() {
			if(arguments.length == 1) {
				panel.printStandard('log', arguments[0]);
			} else {
				panel.setData(arguments[0], arguments[1]);
			}
		}
	}
}