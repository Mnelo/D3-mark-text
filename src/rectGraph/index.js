/* eslint-disable no-useless-concat */
import React, { Component } from "react";
import * as d3 from "d3";
import "./style.less";

class RectGraph extends Component {
  nodes = [];
  edges = [];
  forceSimulation = "";
  svg = "";
  g = "";
  markerIndex = [];

  componentDidMount() {
    this.initData();

    const nodes = [{ name: 1, color: '#666' }, { name: 2 }, { name: 3 }];
    const edges = [
      { lineLength: 200, name: 'line', source: 0, target: 1 },
      { lineLength: 200, name: 'line', source: 0, target: 1, shirft: 1.6 },
      // { lineLength: 200, name: 'line', source: 0, target: 1, shirft: 1.28 },
      { lineLength: 200, name: 'line', source: 1, target: 0, shirft: 1.6 },
      { lineLength: 200, name: 'line', source: 0, target: 2 },
      { lineLength: 200, name: 'line', source: 0, target: 0, radius: 50 },
      { lineLength: 200, name: 'line', source: 0, target: 0, radius: 100 },
      { lineLength: 200, name: 'line', source: 0, target: 0, radius: 150 }
    ];

    this.createGraph(nodes, edges);
  }

  initData = () => {
    this.forceSimulation = d3
      .forceSimulation()
      .force("link", d3.forceLink())
      .force("charge", d3.forceManyBody().strength(-1)) //作用力应用在所用的节点之间，当strength为正的时候可以模拟重力，当为负的时候可以模拟电荷力。
      .force(
        "center",
        d3
          .forceCenter()
          .x(
            document.getElementById("main") &&
            document.getElementById("main").clientWidth / 2
          )
          .y(
            document.getElementById("main") &&
            document.getElementById("main").clientHeight / 2
          )
      ) // 力导向图中心位置
      .force("collision", d3.forceCollide(50)); //设置节点碰撞半径>= 点半径避免重叠

    this.svg = d3
      .select("#main")
      .append("svg")
      .attr("id", "createEntityGraph")
      .attr(
        "width",
        document.getElementById("main") &&
        document.getElementById("main").clientWidth
      )
      .attr(
        "height",
        document.getElementById("main") &&
        document.getElementById("main").clientHeight
      );

    this.g = this.svg.append("g");
  };

  markerEnd = (d) => {
    if (d.radius) {
      if (this.markerIndex.includes(d.index)) {

        this.svg.selectAll(`#end${d.index}`).attr('refX', 135).attr('refY', 18 + d.radius * 37.8 / 50);
      } else {
        this.svg
          .append('marker')
          .attr('id', `end${d.index}`)
          .attr('markerUnits', 'userSpaceOnUse')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 0)
          .attr('refY', 0)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          // .attr('orient', 'auto')
          .attr('stroke-width', 1.5)
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#fff');

        this.markerIndex = [...this.markerIndex, d.index];
      }
    }

    else if (!d.shirft) {
      const refX = Math.sqrt(Math.pow(d.source.x - d.target.x, 2) + Math.pow(d.source.y - d.target.y, 2)) / 2;

      if (this.markerIndex.includes(d.index)) {
        this.svg.selectAll(`#end${d.index}`).attr('refX', refX);
      } else {
        this.svg
          .append('marker')
          .attr('id', `end${d.index}`)
          .attr('markerUnits', 'userSpaceOnUse')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', Math.abs(refX))
          .attr('refY', 0)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('orient', 'auto')
          .attr('stroke-width', 1.5)
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#fff');

        this.markerIndex = [...this.markerIndex, d.index];
      }
    }
    else {
      const dx = d.target.x - d.source.x; //增量
      const dy = d.target.y - d.source.y;

      const dr = d.shirft * Math.sqrt(dx * dx + dy * dy);

      const refX = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / 2;
      const refY = Math.sqrt(Math.pow(dr, 2) - Math.pow(refX, 2)) - dr + 2;

      if (this.markerIndex.includes(d.index)) {
        this.svg.selectAll(`#end${d.index}`).attr('refX', refX).attr('refY', refY);
      } else {
        this.svg
          .append('marker')
          .attr('id', `end${d.index}`)
          .attr('markerUnits', 'userSpaceOnUse')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', refX)
          .attr('refY', refY)
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('orient', 'auto')
          .attr('stroke-width', 3)
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#FFF');

        this.markerIndex = [...this.markerIndex, d.index];
      }
    }

    return `url(#end${d.index})`;
  }

  createGraph = (nodes, edges) => {
    /**
    * @description 缩放函数
    */
    const zoomed = (event) => {
      const transform = event.transform;

      this.g.attr("transform", transform);
    };

    // 设置缩放
    const zoom = d3.zoom().scaleExtent([0.1, 8]).on("zoom", zoomed);

    // 添加图例dom节点svg
    this.svg.call(zoom).on("dblclick.zoom", null);

    // 点渲染
    this.forceSimulation.nodes(nodes).on("tick", this.tick);

    const started = (event, d) => {
      if (!event.active) {
        this.forceSimulation.alphaTarget(0.8).restart();
      }

      d.fx = d.x;
      d.fy = d.y;
    };

    /**
     * @description 拖拽中
     * @param {object} d 拖拽对象
     */
    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    /**
     * @description 拖拽结束
     * @param {object} d 拖拽对象
     */
    const ended = (event, d) => {
      if (!event.active) {
        this.forceSimulation.alphaTarget(0);
      }
      // d.fx = null; // 节点拖拽结束后的位置，注释掉的话，节点位置会变
      // d.fy = null; // 节点拖拽结束后的位置，注释掉的话，节点位置会变
    };

    // 边渲染
    this.forceSimulation
      .force("link")
      .links(edges)
      .distance((d) => {
        return d.lineLength; // 边的长度
      });

    // 边
    this.g
      .selectAll("line")
      .data(edges)
      .enter()
      .append("path")
      .attr("class", "link-node")
      .attr("id", (d, i) => {
        return "edgepath" + i;
      })

    // 节点
    this.g
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("class", "graph-node")
      .attr("width", 270)
      .attr("height", 50)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr("fill", (d, i) => {
        return d.color;
      })
      .attr('stroke', '#cec456')
      .attr('stroke-width', 2)
      .call(
        // 拖拽设置
        d3
          .drag()
          .on("start", started)
          .on("drag", dragged)
          .on("end", ended)
      )
  }

  // 对角线
  setPath = (d) => {

    let dr = 0; // Math.random()*1000

    // 左上
    if (d.source.x >= d.target.x && d.source.y >= d.target.y) {
      if (d.shirft < 2) {
        const dx = d.target.x + 270 - d.source.x; //增量
        const dy = d.target.y + 50 - d.source.y;

        dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
      }

      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x + 270},${d.target.y + 50}`
    }

    // 右上
    if (d.source.x <= d.target.x && d.source.y >= d.target.y) {
      if (d.shirft < 2) {
        const dx = d.target.x - d.source.x - 270; //增量
        const dy = d.target.y + 50 - d.source.y;

        dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
      }

      return `M${d.source.x + 270},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y + 50}`
    }

    // 右下
    if (d.source.x <= d.target.x && d.source.y <= d.target.y) {
      if (d.shirft < 2) {
        const dx = d.target.x - d.source.x - 270; //增量
        const dy = d.target.y - d.source.y - 50;

        dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
      }

      return `M${d.source.x + 270},${d.source.y + 50}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
    }

    // 左下
    if (d.source.x >= d.target.x && d.source.y <= d.target.y) {
      if (d.shirft < 2) {
        const dx = d.target.x + 270 - d.source.x; //增量
        const dy = d.target.y - d.source.y - 50;

        dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
      }

      return `M${d.source.x},${d.source.y + 50}A${dr},${dr} 0 0,1 ${d.target.x + 270},${d.target.y}`
    }
  }

  setCenterPath = (d) => {
    let dr = 0; // Math.random()*1000

    if (d.shirft < 2) {
      const dx = d.target.x - d.source.x; //增量
      const dy = d.target.y - d.source.y;

      dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
    }

    return `M${d.source.x + 135},${d.source.y + 25} A${dr},${dr} 0 0,1 ${d.target.x + 135},${d.target.y + 25}`
  }

  /**
   * @description 渲染图形位置
   */
  tick = () => {
    // 圆点的位置
    this.g.selectAll("rect").attr("transform", (d, i) => {
      return `translate(${d.x},${d.y})`;
    });

    // 线位置
    this.g.selectAll(".link-node").attr("d", (d) => {
      if (d.radius) {
        // const startX = d.source.x;
        // const startY = d.source.y + 25;
        // const endX = d.target.x + 270;
        // const endY = d.target.y + 25;

        // return 'M 220,104 C 240,164 240,164 310,164 380,164 380,164 400,104'
        // return 'M' + ` ${startX},${startY} ` +
        //   'C' +
        //   ` ${startX - d.radius},${startY - d.radius / 2} ` +
        //   ` ${startX - d.radius},${startY - d.radius} ` +
        //   ` ${startX + 135},${startY - d.radius} ` +
        //   ` ${endX + d.radius},${endY - d.radius} ` +
        //   ` ${endX + d.radius},${endY - d.radius / 2} ` +
        //   ` ${endX},${endY} `;


        return `M ${d.source.x},${d.source.y + 25} C ${d.source.x - d.radius},${d.source.y - d.radius} ${d.target.x + d.radius + 270},${d.target.y - d.radius} ${d.target.x + 270},${d.target.y + 25}`;
      }

      return this.setCenterPath(d);
    })
      .attr('marker-end', d => {
        return this.markerEnd(d);
      })
  };

  render() {
    return (
      <div className="rect-graph">
        <div id="main"></div>
      </div>
    );
  }
}

export default RectGraph;
