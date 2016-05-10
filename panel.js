var readline = require('readline');

module.exports = function(__console) {
	var basePanelSymbol = ' ';
	this.data = {
		standard: {
			log: [],
			error: []
		},
		custom: {}
	};

	this.setData = function(name, value) {
		this.data.custom[name] = value;
		this.print();
	}

	this.printStandard = function(fun, value) {
		this.data.standard[fun].push(value);
		print();
	}

	this.setTemplate = function(template) {
		this.template = template;
		this.generatePanel();
	}

	this.generatePanel = function() {
		var windowWidth = process.stdout.columns;
		var windowHeight = process.stdout.rows;
		this.panelEtalon = new Array(windowHeight).fill(Array).map(function() {
			return new Array(windowWidth).fill(basePanelSymbol);
		});
		drawBorders(this.panelEtalon, this.template);
		this.print()
	}

	/**** Border drawing module ****/

	drawBorders = function(panel, template) {
		var borderSets = [
			['┌', '┐', '┘', '└', '─', '│', '├', '┤', '┬', '┴', '┼'],
			['┏', '┓', '┛', '┗', '━', '┃', '┣', '┫', '┳', '┻', '╋'],
			['╔', '╗', '╝', '╚', '═', '║', '╠', '╣', '╦', '╩', '╬']
		]
		var b = borderSets[1];
		var cells = template.cells;

		// Drawe base cell borders
		cells.forEach(function(cell) {
			var frame = cell.frame;
			for(var x = frame.x; x < frame.x + frame.width; x++) {
				panel[frame.y - 1][x] = b[4];
				panel[frame.y + frame.height][x] = b[4];
			}
			for(var y = frame.y; y < frame.y + frame.height; y++) {
				panel[y][frame.x - 1] = b[5];
				panel[y][frame.x + frame.width] = b[5];
			}
		}, this);

		// Find corner type flags
		cells.forEach(function(cell) {
			setCornersFlag(panel, cell.frame);
		});

		// Replace flags with an appropriate border symbol
		for(var y = 0; y < panel.length; y++) {
			for(var x = 0; x < panel[0].length; x++) {
				if(panel[y][x] != basePanelSymbol && !isNaN(panel[y][x])) {
					var symbol_index = 10;
					switch(panel[y][x]) {
						case 1: symbol_index = 0; break;
						case 2: symbol_index = 1; break;
						case 3: symbol_index = 8; break;
						case 4: symbol_index = 2; break;
						case 6: symbol_index = 7; break;
						case 8: symbol_index = 3; break;
						case 9: symbol_index = 6; break;
						case 12: symbol_index = 9; break;
						default: symbol_index = 10;
					}
					panel[y][x] = b[symbol_index];
				}
			}
		}
	}

	function setCornersFlag(panel, frame) {
		var values = [1, 2, 4, 8];	// Corners order: top left, top right, bottom right, bottom left
		var px = [frame.x - 1, frame.x + frame.width, frame.x + frame.width,  frame.x - 1];
		var py = [frame.y - 1, frame.y - 1, 		  frame.y + frame.height, frame.y + frame.height];

		for(var i = 0; i < 4; i++ ) {
			var c = panel[py[i]][px[i]];
			panel[py[i]][px[i]] = isNaN(c) ? values[i] : c | values[i];
		}
	}

	/*### Border drawing module ###*/

	/*### Cell data drawing module ###*/

	function printCellsData() {
		var _panel = this.panelEtalon.map(function(row) {
			return Array.from(row);
		});

		this.template.cells.forEach(function(cell) {
			var frame = cell.dataFrame;
			var y = frame.y;
			cell.data.forEach(function(d) {
				var v = d.name + ': ' + this.data.custom[d.valuePath];
				for(var i = 0; i * frame.width < v.length; i++) {
					var s = v.slice(i*frame.width, i*frame.width+frame.width);
					Array.prototype.splice.apply(_panel[y++], [frame.x, s.length].concat(s.split()));
				}
			}, this);
		}, this);
		return _panel;
	}

	/*### Cell data drawing module ###*/

	this.print = function() {
		var panel = printCellsData.apply(this);
		var panelStr = panel.map(function(row) {
			return row.join('');
		}).join('');

		readline.clearLine(process.stdout);
		readline.cursorTo(process.stdout, 0, 0);
		process.stdout.write(panelStr);
	}
}