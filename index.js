var PanelTemplateParser = require('./panel-template-parser.js')
var Panel = require('./panel.js')

var templateStr = `
	<root columnsWidths='100|*|60'>
		<row height='8'>
			<column rowspan='2'></column>
			<column></column>
			<column></column>
		</row>
		<row height='3'>
			<column></column>
			<column></column>
			<column></column>
		</row>
		<row height='3'>
			<column colspan='2'></column>
			<column colspan='1'></column>
		</row>
		<row height='*'>
			<column colspan='3'></column>
		</row>
	</root> 
`;

var template = new PanelTemplateParser(templateStr);
var panel = new Panel();
panel.setTemplate(template);