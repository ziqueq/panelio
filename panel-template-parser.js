module.exports = function(template) {

	var windowWidth = process.stdout.columns;
	var windowHeight = process.stdout.rows;

	var templateRegexes = {
		get root() 		{ return /<root ?(.*?)>([^]*?)<\/root>/g },
		get rows() 		{ return /<row ?(.*?)>([^]*?)<\/row>/g },
		get attrs()		{ return /(\w+)=['"]?(.*?)['"\s]/g },
		get columns() 	{ return /<column ?(.*?)>([^]*?)<\/column>/g },
		get data()		{ return /<data (.*?)\s*\/>/g }
	};

	/**/
	/* Parse attributes of an element
	/* @param attributes string
	/* Returns element attributes dictionary
	/**/
	function parseAttributes(attributes) {
		var matches, result = {}, r = templateRegexes.attrs;
		while(matches = r.exec(attributes)) {
			result[matches[1]] = isNaN(matches[2]) ? matches[2] : parseInt(matches[2]);
		}
		return result;
	}

	/**/
	/* Parse children from a body of an element
	/* @param kind of children
	/* @param parent body
	/* Returns array of children with their arguments parsed
	/**/
	function parseNode(type, body) {
		var r = templateRegexes[type];
		var matches, result = [];
		var children = {
			'root': 'rows',
			'rows': 'columns',
			'columns': 'data'
		};

		while(matches = r.exec(body)) {
			result.push({
				attributes: parseAttributes(matches[1]),
				body: matches[2]
			});
		}

		return !children[type] ? result : result.forEach(function(parent) {
			parent[children[type]] = parseNode(children[type], parent.body);
		}, this), result;
	}

	function processRows(rows) {
		var index = -1, sum = 0;
		for(var i=0; i<rows.length; i++) {
			var ch = rows[i].attributes.height;
			if(ch == '*') { index = i; }
			else 		  { sum += parseInt(ch); }
		}
		rows[index].attributes.height = windowHeight - sum - rows.length - 1;
		rows[0].attributes.yPosition = 1;
		rows.reduce(function(p, c) {
			c.attributes.yPosition = p.attributes.yPosition + p.attributes.height + 1;
			return c;
		});
		return rows;
	}

	function processCellData(column) {
		return column.data.map(function(data) {
			return data && data.attributes.name && data.attributes.value ? {
				name: data.attributes.name,
				valuePath: data.attributes.value && data.attributes.value.split('.')
			} : undefined;
		}).filter(function(element) {
			return !!element;
		});
	}

	function getCellsInfo(root) {
		var m 		= new Array();
		var cells 	= new Array();

		var columnsPositions = root.attributes.columnsWidths.reduce(function(p, c, i, arr) {
			p[i] = i == 0 ? 1 : p[i-1] + arr[i-1] + 1;
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

				var frame = {
					x: columnsPositions[j],
					y: rows[i].attributes.yPosition,
					width: colspan - 1,
					height: rowspan - 1
				}

				var isWidthCalculated = false;
				for(var ri = 0; ri < rowspan; ri++) {
					for(var ci = 0; ci < colspan; ci++) {
						m[i+ri] = m[i+ri] || new Array();
						m[i+ri][j+ci] = column;
						if(!isWidthCalculated) {
							frame.width += root.attributes.columnsWidths[j+ci];
						}
					}
					isWidthCalculated = true;
					frame.height += rows[i+ri].attributes.height;
				}

				cells.push({
					info: column,
					frame: frame,
					data: processCellData(column)
				})
			}
		}
		return cells;
	}

	this.root = (function() {
		var _root = parseNode('root', template)[0];
		processRows(_root.rows);

		_root.attributes.columnsWidths = _root.attributes.columnsWidths.split('|').map(function(width){
			return width == '*' ? '*' : parseInt(width);
		});
		_root.attributes.columnsCount = _root.attributes.columnsWidths.length;

		var index = -1, sum = 0;
		for(var i=0; i<_root.attributes.columnsCount; i++) {
			var ch = _root.attributes.columnsWidths[i];
			if(ch === '*') {
				index = i;
			} else {
				sum += parseInt(ch);
			}
		}
		_root.attributes.columnsWidths[index] = windowWidth - sum - _root.attributes.columnsWidths.length - 1;
		return _root;
	})();

	this.cells = getCellsInfo(this.root);
};