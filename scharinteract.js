/*
 * Scharinteract.js
 * @version 1.0
 * @author Timo Hausmann <hello@timohausmann.de>
 * @licence The MIT License (MIT)
 * @repository https://github.com/timohausmann/scharinteract.js
 */


/**
 * Factor for converting degree values into radian.
 */
Math.TO_RAD = Math.PI/180;


/**
 * return a random number within given boundaries.
 *
 * @param {number} min		the lowest possible number
 * @param {number} max		the highest possible number
 * @param {boolean} round	if true, return integer
 * @return {number} 		a random number
 */
Math.randMinMax = function(min, max, round) {

	var val = min + (Math.random() * (max - min));
	
	if( round ) val = Math.round( val );
	
	return val;
};


(function(window, Math) {

 	/*
 	 * DOM
 	 */
 	var 	canvas = document.querySelector('#canvas'),
		ctx = canvas.getContext('2d');


	/*
	 * Parameters
	 */
	var 	line_lifetime = 2000, //Lebensdauer einer Linie (in ms)
		degree_delta = 0.5, //Gradaenderung pro Iteration
		line_len_delta = 3, //Groessenaenderung pro Iteration
		line_pos_delta = 1.5; //Positionsaenderung pro Iteration
	 
	 
	/*
	 * Runtime Variables
	 */
	var 	degree = 0, //aktuelle Gradzahl
		lines = [], //Array fuer unsere Linien
		mouseX = 0, //Mausposition X
		mouseY = 0; //Mausposition Y


	/*
	 * setup
	 */ 
	function setup() {

		canvas.width = window.innerWidth;
 		canvas.height = window.innerHeight;

 		canvas.addEventListener('mousemove', function(e) {

			mouseX = e.offsetX || e.layerX, 
			mouseY = e.offsetY || e.layerY;
		});

		mouseX = canvas.width/2,
		mouseY = canvas.height/2;
	}

	/*
	 * draw
	 */
	function draw() {

		var currLine;

		ctx.fillStyle = 'white';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		
		//degree laeuft von 0 bis endlos.
		degree += degree_delta;
		
		//Neue Linie an Position mouseX, mouseY mit gegebener Drehung erstellen.
		//sin(radians(degree)) pendelt zwischen -1 und 1 hin und her; durch die *360 schliesslich zwischen -360 und +360. 
		//Mit der 45 wird dafuer gesorgt, dass die Endstellungen des Pendelns diagonal sind, also -315 und +405
		lines.push( new Line(mouseX, mouseY, 45 + (Math.sin(degree * Math.TO_RAD) * 360)) );
			
		//ueber alle Linien loopen ...
		for(var i=0;i<lines.length;i++) {
			
			currLine = lines[i];

			if( currLine.isDead() ) continue;
			
			//Linie aktualisieren und malen
			currLine.update();
			currLine.paint( ctx );
		}


		window.requestAnimationFrame( draw );
	}


	/*
	 * Line
	 * @param float _x  X-Position
	 * @param float _x  Y-Position
	 * @param float _degree Drehung in Grad
	 */
	function Line(x, y, degree) { 
		
		this.birth 	= new Date(), //Zeitpunkt der Erstellung (in ms)
		this.age 	= 0, //Derzeitige Lebensdaur (in ms)
		this.x 		= x, //X-Position
		this.y 		= y, //Y-Position
		this.len 	= Math.randMinMax(300,400), //Laenge
		this.degree 	= degree; //Drehung in Grad
	}
		
	/*
	 * Line.prototype
	 */
	Line.prototype = {

		/*
		 * Line.update
		 * Diese Funktion aktualisiert lediglich die Werte der Linie
		 */
		update : function() {
		
			//Alter aktualisieren
			this.age = new Date() - this.birth;
			
			//Linienlaenge aktualisieren
			this.len += line_len_delta;
			
			//Position aktualisieren
			this.x += (Math.sin( degree * Math.TO_RAD ) * line_pos_delta);
			this.y -= (Math.cos( degree * Math.TO_RAD ) * line_pos_delta);
		},
		
		
		/*
		 * Line.paint
		 * Diese Funktion zeichnet die Linie
		 */
		paint : function( ctx ) { 
			
			//Alphawert anhand des Alters bestimmen
			var alpha = 1 - (this.age/2000);
			 
			//Da x und y nur den Mittelpunkt der Linie beschreiben, 
			//muessen wir die Linie mithilfe der Gradzahl eine halbe Laenge weitterrechnen.
			//Diese Werte addieren und subtrahieren wir dann pro Achse einmal, 
			//um Start- und Endpunkt zu erhalten.
			var len_x = (Math.cos( this.degree * Math.TO_RAD ) * (this.len/2));
			var len_y = (Math.sin( this.degree * Math.TO_RAD ) * (this.len/2));
			 
			ctx.strokeStyle = 'rgba(0,0,0,' + alpha + ')';
			ctx.beginPath();
			ctx.moveTo(this.x + len_x, this.y + len_y);
			ctx.lineTo(this.x - len_x, this.y - len_y);
			ctx.closePath();
			ctx.stroke();
		},
		
		
		/*
		 * Line.isDead 
		 * @return boolean true, wenn Lebensdauer der Linie ueberschritten
		 */
		isDead : function() {
			
			return ( this.age > line_lifetime );
		}
	};

	setup();
	draw();

})(window, Math);