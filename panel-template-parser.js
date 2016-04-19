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
				columns: parseColumns(matches[2])
			});
		}
		return rows;
	}

	// Returns [cellsMatrix, cellsSizes]
	function getCellsInfo(root) {
		var result = new Array();
		var cellsSizes = new Array();
		var columnsCount = root.attributes.columnsWidths.length;
		var rows = root.rows;
		for(var i=0; i<rows.length; i++) {
			for(var j=0; j<columnsCount; j++) {
				var column = rows[i].columns[j];
				if(!column) break;

				while(result[i] && result[i][j] != undefined) {
					j++;
				}

				var colspan = column.attributes.colspan || 1;
				var rowspan = column.attributes.rowspan || 1;
				cellsSizes[i] = cellsSizes[i] || [];
				cellsSizes[i][j] = [0, 0]

				var isWidthCalculated = false;
				for(var ri = 0; ri < rowspan; ri++) {
					for(var ci = 0; ci < colspan; ci++) {
						result[i+ri] = result[i+ri] || new Array();
						result[i+ri][j+ci] = column;
						if(!isWidthCalculated) {
							cellsSizes[i][j][0] += root.attributes.columnsWidths[j+ci];
						}
					}
					isWidthCalculated = true;
					cellsSizes[i][j][1] += rows[i+ri].attributes.height;
				}
			}
		}
		return [result, cellsSizes];
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
	for(var i=0; i<root.rows.length; i++) {
		var ch = root.rows[i].attributes.height;
		if(ch == '*') {
			index = i;
		} else {
			sum += parseInt(ch);
		}
	}
	root.rows[index].attributes.height = windowHeight - sum - root.rows.length - 1;

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

	var cellsInfo = getCellsInfo(root);
	var cellsMatrix = cellsInfo[0];
	var cellsSizes = cellsInfo[1];

	this.root = root;
	this.cellsMatrix = cellsMatrix;
	this.cellsSizes = cellsSizes;
};