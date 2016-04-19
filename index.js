var PanelTemplateParser = require('./panel-template-parser.js')

var templateStr = `
	<root columnsWidths='40|*'>
		<row height='8'>
			<column rowspan='2'>
				name:    \${name}
				surname: \${surname}
			</column>
			<column>

			</column>
		</row>
		<row height='3'>
			<column>

			</column>
		</row>
		<row height='3'>
			<column colspan='2'>

			</column>
		</row>
		<row height='*'>
			<column colspan='2'>

			</column>
		</row>
	</root> 
`;

var template = new PanelTemplateParser(templateStr);
console.log(template.cells);