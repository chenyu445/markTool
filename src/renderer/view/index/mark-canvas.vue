<template lang="pug">
  div#markScreen(ref="canvasScreen")
    //- chart(:options="polar")
    //- ve-line(:data="chartData" :settings="chartSettings" :grid="grid" :xAxis="xAxis") 
    div#markBox(ref='markBox' :style="{left:path.startX + 'px',top:path.startY + 'px', width:path.endX + 'px',height:path.endY + 'px'}" v-show="isMarking")
    svg#markCanvas(ref="canvas" width="800" height="800" @mousedown="canvasMousedown" @mouseup="canvasMouseup" @mousemove="canvasMousemove" :class="{'crosshair': isMarking}")
    svg#markCanvasBak(ref="markSVG" width="750" height="500" @mousedown="canvasMousedown" @mouseup="canvasMouseup" @mousemove="canvasMousemove" :class="{'crosshair': isMarking}")
</template>

<script>
import * as d3 from "d3";
export default {
  name: 'markCanvas',  
  props:['data'],
  data (){   
    return {
      canvas:{}
      ,markSVG:{}
      ,context:{}
      ,overMark:null
      ,stage_info:{}
      ,isMarking:false
      ,canvasStart:{}
      ,currentWorkImage :{}
      ,canvasScreen:{}
      ,path:{
        startX:0
        ,startY:0
        , endX:0
        , endY:0
      }
      ,markList:[        
      ] 
    }
  },
  methods: { 
    canvasMousedown(e){     
      this.stage_info = this.canvas._groups[0][0].getBoundingClientRect()
      this.isMarking = true
      this.canvasStart.x = e.pageX
      this.canvasStart.y = e.pageY
      this.path.startX = e.pageX-this.stage_info.left
      this.path.startY = e.pageY-this.stage_info.top
    },
    canvasMouseup (e){      
      this.isMarking = false      
      this.canvasStart ={}
      // this.context.rect(this.path.startX,this.path.startY,this.path.endX ,this.path.endY)
      // this.context.stroke()
       var that = this
      if(this.path.endX != 0 && this.path.endY != 0){
        this.markList.push(this.path)
        this.path = {
          startX:0
          ,startY:0
          , endX:0
          , endY:0
        }
      }      
      // console.log('this.markList:', this.markList)      
    },
    canvasMousemove(e){        
      if(this.isMarking ){
        this.path.endX = e.pageX-this.canvasStart.x
        this.path.endY = e.pageY-this.canvasStart.y
        var box = this.$refs.markBox
        // console.log('box:',[box])
        box.style.top = this.path.startY +'px'
        box.style.left = this.path.startX+'px'
        box.style.width = this.path.endX+'px'
        box.style.height = this.path.endY+'px'
        // debugger
        // console.log('box:',[box])
      }        
    }
  }
  ,mounted (){
    console.log('mounted canvas data:',this.data)
    var transform = d3.zoomIdentity;
    var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", zoomed);

		function zoomed() {
			d3.select(this).attr("transform", d3.event.transform)
		}

    this.canvasScreen = this.$refs.canvasScreen
    this.canvas = d3.select(this.$refs.canvas)
    this.markSVG = d3.select(this.$refs.markSVG)
    // console.log('canvas:', [this.canvas])    .append('g')
    var Xarr = []
    var Yarr = []
    for(var i =0; i < 800/20 ; i++){
      Xarr.push({x1:20*i,y1:0,x2:20*i,y2:800})
    }
    for(var i =0; i < 800/20 ; i++){
      Yarr.push({x1:0,y1:20*i,x2:800,y2:20*i})
    }
    setTimeout(() => {
      // console.log('Xarr:',Xarr)
      var info = this.canvas.append('g').attr('class','info')
      info.append('text').text('纸速：25mm/s,灵敏度：10mm/mv, BL:ON, AC:ON, MF:60Hz').attr('x',450).attr('y',20);      
      for(var i = 0 ; i < 12 ; i++){
        var text = ''
        switch(i){
          case 0: 
            text='Ⅰ'
            break;
          case 1: 
            text='Ⅱ' 
            break;
          case 2: 
            text='Ⅲ' 
            break;
          case 3: 
            text='aVR' 
            break;
          case 4: 
            text='aVL' 
            break;
          case 5: 
            text='aVF' 
            break;
          case 6: 
            text='V1' 
            break;
          case 7: 
            text='V2' 
            break;
          case 8: 
            text='V3' 
            break;
          case 9: 
            text='V4' 
            break;
          case 10: 
            text='V5' 
            break;
          case 11: 
            text='V6'
        }
        info.append('text').text(text).attr('x',20).attr('y',60*(i+1)-20)
      }
      this.canvas.append('g').attr('class','Xaxis')
                .selectAll('.XaxisLine')                
                .data(Xarr)
                .enter()
                .append('line')
                .attr('class','XaxisLine')
                .attr('x1',function(d){return d.x1})
                .attr('y1',function(d){return d.y1})
                .attr('x2',function(d){return d.x2})
                .attr('y2',function(d){return d.y2})
                .attr('stroke',function(d,i){
                  return i%5 != 0 ? '#A00000':'red'
                })
                .attr('stroke-width',0.5);
      this.canvas.append('g').attr('class','Yaxis')
                .selectAll('.YaxisLine')
                .data(Yarr)
                .enter()
                .append('line')
                .attr('class','YaxisLine')
                .attr('x1',function(d){return d.x1})
                .attr('y1',function(d){return d.y1})
                .attr('x2',function(d){return d.x2})
                .attr('y2',function(d){return d.y2})
                .attr('stroke','#A00000')
                .attr('stroke-width',0.5);
    }, 20);
    
  }
  ,watch:{
    data:function(val,oldVal){
      console.log('new:', val, oldVal)
      // console.log('new: %s, old: %s', val, oldVal)
      if(val.length != 0){
        
        val.forEach((data,index) => {
          // console.log(d,index)
          this.canvas.append('g').attr('class','Line'+(index+1))                    
                .selectAll('.L'+index)
                .data(data)
                .enter()
                .append('line')
                .attr('class','L'+index)
                .attr('x1',function(d,i){return i*760/3640 +30})
                .attr('y1',function(d,i){return index > 0 ? d*40 +60*(index+1)-20: d*40 +40*(index+1)})
                .attr('x2',function(d,i){return (i+1)*760/3640 +30})
                .attr('y2',function(d,i){
                  if(index > 0){
                    return i+1 >= data.length ? 60*(index+1) : data[i+1]*40 +60*(index+1)-20
                  }else{
                    return i+1 >= data.length ? 40*(index+1) : data[i+1]*40 +40*(index+1)
                  }
                  
                })
                .attr('stroke','#000')
                .attr('stroke-width',1);
        });
      }
    },
    markList:function(val,oldVal){
      if(val.length != 0){
        this.markSVG.selectAll("rect")
            .data(val)
            .enter()
            .append('rect')
            .attr('x',function(d,i){
              return d.startX
            })
            .attr('y',function(d,i){
              return d.startY
            })
            .attr('width',function(d,i){
              return d.endX
            })
            .attr('height',function(d,i){
              return d.endY
            })
            .attr("fill","transparent")
            .attr('stroke','blue')
            .attr('stroke-width',1);
      }
      
    }
  }
}
</script>

<style lang="scss">
  #markScreen{
    position: relative;
    width: 800px;
    height: 800px;
    // overflow: hidden;
    top:50%;
    margin-top:-400px;
    left: 50%;
    margin-left: -400px;
    // .currentWorkImg{
    //   width: 100%;
    //   height: 100%;
    //   // float: left;
    // }
    #markCanvas{
      // height: 500px;
      // width: 750px;
      position: absolute;
      top: 0;
      left: 0;
      // border:1px solid red;
    }
    #markBox{
      position: absolute;
      top: 0;
      left: 0;
      border:1px solid red;
    }
    #markCanvasBak{
      height: 800px;
      width: 800px;
      position: absolute;
      top: 0;
      left: 0;
      border:1px solid red;
    }
    .crosshair{
      cursor: crosshair;
    }
  }
</style>