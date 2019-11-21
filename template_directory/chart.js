//Set Height and Width Vars;
const w=1000;
const h=300;
const padding=30;

//Define Unique Function;
const unique = (value, index, self) => {
  return self.indexOf(value) === index
}

//Populate Select Box;
let subjlist = aedata.map(function(d){return d.subjid})
						  .filter(unique)
						  .sort();
						  
let select = document.getElementById("subjSelect");

for(let i=0; i < subjlist.length; i++){
	let newSelect = document.createElement("option");
	
	newSelect.textContent = subjlist[i];
	newSelect.value = subjlist[i];
	
	select.appendChild(newSelect);
}

//Define colors;
const colorArray = ["#FFFFB2","#FECC5C","#FD8D3C","#F03B20","#BD0026"];

//Initialize SVG;
const svg = d3.select("#plot")
			  .append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("overflow", "visible");
				
//Define Date Format;
const formatDate = d3.timeFormat("%Y-%m-%d");
			
//Initialize to first subject;
let subjid= d3.select("#subjSelect").node().value;
let subjectData = [];

//Grab Subject Data;
let j=0;	
for(let i=0; i < aedata.length; i++){
	if(aedata[i].subjid === subjid){
		subjectData.push({
			subjid: aedata[i].subjid,
			age: +aedata[i].age,
			sex: aedata[i].sex,
			trtGrp: aedata[i].TRT01A,
			trtStart: new Date(aedata[i].TRTSDT),
			trtEnd: new Date(aedata[i].TRTEDT),
			aeStart: new Date(aedata[i].AESTDT),
			aeEnd: new Date(aedata[i].AEENDT),
			aeDecod: aedata[i].AEDECOD,
			toxGrade: +aedata[i].AETOXGRN
		});
		
		j++;
	}
}
		
//Get Domain and Range Data;
let aeDomain = subjectData.map(function(d){return d.aeDecod})
						  .filter(unique)
						  .sort();

let aeRange = [];
let aeMinDate = [];
		
for(let i=0; i < aeDomain.length; i++){
	aeRange.push(i*((h-(padding*2))/aeDomain.length)+10);
	
	aeMinDate.push(d3.min(subjectData, function(d){
		if(aeDomain[i] === d.aeDecod){
			return d.aeStart;
		}
	}));
}

//Set X Scale;
let xScale = d3.scaleTime()
			   .domain([
					subjectData[0].trtStart,
					subjectData[0].trtEnd
			   ])
			   .range([0+padding,w-padding]);

//Set Y Scale;
let yScale = d3.scaleOrdinal()
			   .domain(aeDomain)
			   .range(aeRange);
		   
//Define Axes;
let xAxis = d3.axisBottom()
			  .scale(xScale)
			  .ticks(10)
			  .tickFormat(formatDate)
			  .tickSizeOuter(0);
		
//Draw Bars
svg.append("g")
	 .attr("class","plotArea")
   .selectAll("rect")
	 .data(subjectData)
	 .enter()
   .append("rect")
	 .attr("x",function(d){
		return xScale(d.aeStart);
	 })
	 .attr("y", function(d) {
		return yScale(d.aeDecod);
	 })
	 .attr("width", function(d){
		return xScale(d.aeEnd)-xScale(d.aeStart);
	 })					
	 .attr("height", ((h-(padding*2))/aeDomain.length)-5)
	 .attr("fill",function(d){
		return colorArray[d.toxGrade-1];
	 })
	 .attr("stroke","#000");	 

//Draw Labels
svg.select(".plotArea")
   .selectAll("text")
	 .data(aeDomain)
	 .enter()
   .append("text")
	 .text(function(d) {
		return d;
	 })
	 .attr("x",function(d,i){
		return xScale(aeMinDate[i])-5;
	 })
	 .attr("y",function(d,i) {
		return aeRange[i] + ((h-(padding*2))/aeDomain.length)/2+2;
	 })
	 .attr("font-family","sans-serif")
	 .attr("font-size","0.95em")
	 .attr("fill","#000")
	 .attr("text-anchor","end");
			 
//X Axis;
svg.append("g")
   .attr("class","axis")
   .attr("transform","translate(0," + (h - padding) + ")")
   .call(xAxis);
   
//Populate Table;
d3.select("#tSubject")
	.text(subjid);
	
d3.select("#tAge")
	.text(subjectData[0].age);
	
d3.select("#tSex")
	.text(subjectData[0].sex);
	
d3.select("#tTrtGrp")
	.text(subjectData[0].trtGrp);
	
d3.select("#tTrtStart")
	.text(formatDate(subjectData[0].trtStart));
	
d3.select("#tTrtEnd")
	.text(formatDate(subjectData[0].trtEnd));

//Initialize Current Selection Variable;
let curSelect;
let curSelectColor;

//Define Click Event;
svg.select(".plotArea")
   .selectAll("rect")
	 .on("click",function(d){
		if(!curSelect){
			d3.select(this)
			  .transition()
			  .style("fill","#3498EB");
			  
			//Populate Table;
			d3.select("#tAEDecod")
				.text(d.aeDecod);
				
			d3.select("#tAEStart")
				.text(formatDate(d.aeStart));
				
			d3.select("#tAETox")
				.text(d.toxGrade);
				
			d3.select("#tAEEnd")
				.text(formatDate(d.aeEnd));
				
			//Hide Text;
			d3.select("#initialInfo").classed("hidden",true);
			
			//Unhide Table;
			d3.select("#aeInfo").classed("hidden",false);
			
			curSelect = this;
			curSelectColor = colorArray[d.toxGrade-1];
		}else if(curSelect===this){
			d3.select(this)
			  .transition()
			  .style("fill",curSelectColor);
			  
			//Unhide Text;
			d3.select("#initialInfo").classed("hidden",false);
			
			//Hide Table;
			d3.select("#aeInfo").classed("hidden",true);
			
			curSelect = undefined;
			curSelectColor = undefined;
		}else{
			d3.select(this)
			  .transition()
			  .style("fill","#3498EB");
			  
			d3.select(curSelect)
			  .transition()
			  .style("fill",curSelectColor);
			  
			//Populate Table;
			d3.select("#tAEDecod")
				.text(d.aeDecod);
				
			d3.select("#tAEStart")
				.text(formatDate(d.aeStart));
				
			d3.select("#tAETox")
				.text(d.toxGrade);
				
			d3.select("#tAEEnd")
				.text(formatDate(d.aeEnd));
			
			curSelect = this;
			curSelectColor = colorArray[d.toxGrade-1];
		}
	 });
   
//Define action for subject selection;			
d3.select("#subjSelect")
	.on("change", function(){
		subjid=d3.select(this).node().value;
		
		subjectData = [];

		//Grab Subject Data;
		let j=0;	
		for(let i=0; i < aedata.length; i++){
			if(aedata[i].subjid === subjid){
				subjectData.push({
					subjid: aedata[i].subjid,
					age: +aedata[i].age,
					sex: aedata[i].sex,
					trtGrp: aedata[i].TRT01A,
					trtStart: new Date(aedata[i].TRTSDT),
					trtEnd: new Date(aedata[i].TRTEDT),
					aeStart: new Date(aedata[i].AESTDT),
					aeEnd: new Date(aedata[i].AEENDT),
					aeDecod: aedata[i].AEDECOD,
					toxGrade: +aedata[i].AETOXGRN
				});
				
				j++;
			}
		}
		
		//Get Domain and Range Data;
		aeDomain = subjectData.map(function(d){return d.aeDecod})
							  .filter(unique)
							  .sort();
		
		aeRange = [];
		aeMinDate = [];
		
		for(let i=0; i < aeDomain.length; i++){
			aeRange.push(i*((h-(padding*2))/aeDomain.length)+10);
			
			aeMinDate.push(d3.min(subjectData, function(d){
				if(aeDomain[i] === d.aeDecod){
					return d.aeStart;
				}
			}));
		}

		//Set X Scale;
		xScale = d3.scaleTime()
				   .domain([
						subjectData[0].trtStart,
						subjectData[0].trtEnd
					])
				   .range([0+padding,w-padding]);
		
		//Set Y Scale;
		yScale = d3.scaleOrdinal()
				   .domain(aeDomain)
				   .range(aeRange);
		   
		//Define Axes;
		xAxis = d3.axisBottom()
				  .scale(xScale)
				  .ticks(10)
				  .tickFormat(formatDate)
				  .tickSizeOuter(0);
					
		//Remove Previous Contents
		svg.select(".plotArea")
		   .selectAll("rect")
		   .remove();
		   
		svg.select(".plotArea")
		   .selectAll("text")
		   .remove();	
		
		//Draw Bars
		svg.select(".plotArea")
		   .selectAll("rect")
			 .data(subjectData)
			 .enter()
		   .append("rect")
			 .attr("x",function(d){
				return xScale(d.aeStart);
			 })
			 .attr("y", function(d) {
				return yScale(d.aeDecod);
			 })
			 .attr("width", function(d){
				return xScale(d.aeEnd)-xScale(d.aeStart);
			 })					
			 .attr("height", ((h-(padding*2))/aeDomain.length)-5)
			 .attr("fill",function(d){
				return colorArray[d.toxGrade-1];
			 })
			 .attr("stroke","#000");	 

		//Draw Labels
		svg.select(".plotArea")
		   .selectAll("text")
			 .data(aeDomain)
			 .enter()
		   .append("text")
			 .text(function(d) {
				return d;
			 })
			 .attr("x",function(d,i){
				return xScale(aeMinDate[i])-5;
			 })
			 .attr("y",function(d,i) {
				return aeRange[i] + ((h-(padding*2))/aeDomain.length)/2+2;
			 })
			 .attr("font-family","sans-serif")
			 .attr("font-size","0.95em")
			 .attr("fill","#000")
			 .attr("text-anchor","end");
			 
		//X Axis;
		svg.select(".axis")
		   .transition()
		   .call(xAxis);	

		//Populate Table;
		d3.select("#tSubject")
			.text(subjid);
			
		d3.select("#tAge")
			.text(subjectData[0].age);
			
		d3.select("#tSex")
			.text(subjectData[0].sex);	

		d3.select("#tTrtGrp")
			.text(subjectData[0].trtGrp);
			
		d3.select("#tTrtStart")
			.text(formatDate(subjectData[0].trtStart));
			
		d3.select("#tTrtEnd")
			.text(formatDate(subjectData[0].trtEnd));	

		curSelect = undefined;
		curSelectColor = undefined;

		//Unhide Text;
		d3.select("#initialInfo").classed("hidden",false);
		
		//Hide Table;
		d3.select("#aeInfo").classed("hidden",true);

		//Define Click Event;
		svg.select(".plotArea")
		   .selectAll("rect")
			 .on("click",function(d){
				if(!curSelect){
					d3.select(this)
					  .transition()
					  .style("fill","#3498EB");
					  
					//Populate Table;
					d3.select("#tAEDecod")
						.text(d.aeDecod);
						
					d3.select("#tAEStart")
						.text(formatDate(d.aeStart));
						
					d3.select("#tAETox")
						.text(d.toxGrade);
						
					d3.select("#tAEEnd")
						.text(formatDate(d.aeEnd));
						
					//Hide Text;
					d3.select("#initialInfo").classed("hidden",true);
					
					//Unhide Table;
					d3.select("#aeInfo").classed("hidden",false);
					
					curSelect = this;
					curSelectColor = colorArray[d.toxGrade-1];
				}else if(curSelect===this){
					d3.select(this)
					  .transition()
					  .style("fill",curSelectColor);
					  
					//Unhide Text;
					d3.select("#initialInfo").classed("hidden",false);
					
					//Hide Table;
					d3.select("#aeInfo").classed("hidden",true);
					
					curSelect = undefined;
					curSelectColor = undefined;
				}else{
					d3.select(this)
					  .transition()
					  .style("fill","#3498EB");
					  
					d3.select(curSelect)
					  .transition()
					  .style("fill",curSelectColor);
					  
					//Populate Table;
					d3.select("#tAEDecod")
						.text(d.aeDecod);
						
					d3.select("#tAEStart")
						.text(formatDate(d.aeStart));
						
					d3.select("#tAETox")
						.text(d.toxGrade);
						
					d3.select("#tAEEnd")
						.text(formatDate(d.aeEnd));
					
					curSelect = this;
					curSelectColor = colorArray[d.toxGrade-1];
				}
			 });						
	});
