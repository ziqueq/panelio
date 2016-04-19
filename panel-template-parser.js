module.exports = function(template) {

	var windowWidth = process.stdout.columns;
	var windowHeight = process.stdout.rows;

	var templateRegexes = {
		root: 		/<root ?(.*?)>([^]*?)<\/root>/,
		rows: 		/<row ?(.*?)>([^]*?)<\/row>/g,
		columns: 	/<column ?(.*?)>([^]*?)<\/column>/g,
		attrs: 		/(\w+)=['"]?(.*?)['"\s]/g
	};

	function parseAttributes(attributes) {
		var matches, result = {};
		while(matches = templateRegexes.attrs.exec(attributes)) {
			result[matches[1]] = isNaN(matches[2]) ? matches[2] : parseInt(matches[2]);
		}
		return result;
	}

	function parseColumns(rowBody) {
		var matches, result = [];
		while(matches = templateRegexes.columns.exec(rowBody)) {
			result.push({
				attributes: parseAttributes(matches[1]),
				body: matches[2]
			})
		}
		return result;
	}

	function parseRows(rootBody) {
		var matches, rows = [];
		while(matches = templateRegexes.rows.exec(rootBody)) {
			rows.push({
				attributes: parseAttributes(matches[1]),
				columns: parseColumns(matches[2]),
			});
		}

		var index = -1, sum = 0;
		for(var i=0; i<rows.length; i++) {
			var ch = rows[i].attributes.height;
			if(ch == '*') {
				index = i;
			} else {
				sum += parseInt(ch);
			}
		}
		rows[index].attributes.height = windowHeight - sum - rows.length - 1;
		rows[0].attributes.yPosition = 1;

		rows.reduce(function(p, c) {
			c.attributes.yPosition = p.attributes.yPosition + p.attributes.height + 1;
			return c;
		});
		return rows;
	}



	function getCellsInfo(root) {
		var m 				= new Array();
		var cells 			= new Array();

		var columnsPositions = root.attributes.columnsWidths.reduce(function(p, c, i) {
			p[i] = i == 0 ? 1 : p[i-1] + c + 1;
			return p;
		}, []);

		var rows = root.rows;
		for(var i=0; i<rows.length; i++) {
			for(var j=0; j<root.attributes.columnsCount; j++) {
				var column = rows[i].columns[j];
				if(!column) break;
				while(m[i] && m[i][j] != undefined) { j++; }

				var colspan = column.attributes.colspan || 1;
				var rowspan = column.attributes.rowspan || 1;

				var cellPosition = {
					x: columnsPositions[j],
					y: rows[i].attributes.yPosition,
					width: 0,
					height: 0
				}

				var isWidthCalculated = false;
				for(var ri = 0; ri < rowspan; ri++) {
					for(var ci = 0; ci < colspan; ci++) {
						m[i+ri] = m[i+ri] || new Array();
						m[i+ri][j+ci] = column;
						if(!isWidthCalculated) {
							cellPosition.width += root.attributes.columnsWidths[j+ci];
						}
					}
					isWidthCalculated = true;
					cellPosition.height += rows[i+ri].attributes.height;
				}

				cells.push({
					info: column,
					position: cellPosition
				})
			}
		}
		return cells;
	}

	var p1 = template.match(templateRegexes.root);
	var root = {
		attributes: parseAttributes(p1[1]),
		rows: parseRows(p1[2])
	}
	root.attributes.columnsWidths = root.attributes.columnsWidths.split('|').map(function(width){
		return width == '*' ? '*' : parseInt(width);
	});
	root.attributes.columnsCount = root.attributes.columnsWidths.length;

	var index = -1, sum = 0;
	for(var i=0; i<root.attributes.columnsCount; i++) {
		var ch = root.attributes.columnsWidths[i];
		if(ch === '*') {
			index = i;
		} else {
			sum += parseInt(ch);
		}
	}
	root.attributes.columnsWidths[index] = windowWidth - sum - root.attributes.columnsWidths.length - 1;

	this.root = root;
	this.cells = getCellsInfo(root);
};