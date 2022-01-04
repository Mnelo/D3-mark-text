import React, { Component } from "react";
import * as d3 from "d3";
import "./style.less";

class D3Graph extends Component {
  nodes = [];
  edges = [];
  forceSimulation = "";
  svg = "";
  g = "";
  nodeId = 0;

  componentDidMount() {
    this.initData();

    this.createGraph();
  }

  /**
   * @description 初始化配置数据
   */
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

  deleteNode = (data) => {
    this.nodes = this.nodes.filter((item, index) => {
      return data.id !== item.id;
    });

    // 删除点
    this.g.selectAll("circle").attr("class", (d, i) => {
      if (data.id === d.id) {
        return "delete-node";
      }

      return "graph-node";
    });

    // 删除点的描述
    this.g.selectAll(".node-des").attr("class", (d, i) => {
      if (data.id === d.id) {
        return "delete-node";
      }

      return "node-des";
    });

    this.g.selectAll(`.delete-node`).remove();
  };

  addNode = () => {
    this.nodes = [
      ...this.nodes,
      { color: "456789", name: "3", x: 300, y: 200, id: this.nodeId },
    ];

    this.nodeId++;

    this.updateNodes();
  };

  // 加边
  addline = () => {
    let addEdge = [{ target: 0, source: 1, lineLength: 100, name: "边" }];
    this.edges = [...this.edges, ...addEdge];

    this.updateEdges(addEdge);
  };

  // 删边
  deleteLine = () => {
    // 例子删除 0这条边
    this.edges = this.edges.filter((item, index) => {
      return index !== 0;
    });

    this.g.selectAll(".link-node").attr("class", (d, i) => {
      if (d.index === 0) {
        return "delete-edge";
      }

      return "link-node";
    });

    this.g.selectAll(".edge-des").attr("class", (d, i) => {
      if (d.index === 0) {
        return "delete-edge";
      }

      return "edge-des";
    });

    this.g.selectAll(`.delete-edge`).remove();
  };

  updateNodes = () => {
    this.g.selectAll(`.node-des`).remove();

    this.g
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("class", "graph-node")
      .attr("r", 20) // 节点大小
      .attr("fill", (d, i) => {
        return d.color;
      })
      .call(
        // 拖拽设置
        d3
          .drag()
          .on("start", this.started)
          .on("drag", this.dragged)
          .on("end", this.ended)
      )
      .on("click", (d, i) => {
        this.deleteNode(i);
      });

    this.g
      .selectAll("nodeText")
      .data(this.nodes)
      .enter()
      .append("text")
      .attr("class", "node-des")
      .text((d, i) => {
        return d.name;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", 14) // 文字大小
      .attr("fill", (d, i) => {
        return "#242B45";
      });

    this.forceSimulation.nodes(this.nodes);
    this.forceSimulation.alpha(1).restart();
  };

  updateEdges = (edges) => {
    this.g
      .selectAll("line")
      .data(edges)
      .enter()
      .append("path")
      .attr("id", (d, i) => {
        return "edgepath" + i;
      })
      .attr("class", "link-node")
      .attr("stroke", (d) => {
        return "#325764";
      });

    this.g
      .selectAll("edgeText")
      .data(edges)
      .enter()
      .append("text")
      .attr("class", "edge-des")
      .attr("xlink:href", (d, i) => {
        return "#edgepath" + i;
      })
      .text((d, i) => {
        return "";
      })
      .attr("fill", (d, i) => {
        return "#242B45"; // 箭头字体颜色
      })
      .append("textPath")
      .attr("xlink:href", (d, i) => {
        return "#edgepath" + i;
      })
      .text((d, i) => {
        return d.name;
      });

    this.forceSimulation.force("link").links(this.edges);
    this.forceSimulation.alpha(1).restart();
  };

  started = (event, d) => {
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
  dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  /**
   * @description 拖拽结束
   * @param {object} d 拖拽对象
   */
  ended = (event, d) => {
    if (!event.active) {
      this.forceSimulation.alphaTarget(0);
    }
    // d.fx = null; // 节点拖拽结束后的位置，注释掉的话，节点位置会变
    // d.fy = null; // 节点拖拽结束后的位置，注释掉的话，节点位置会变
  };

  createGraph = () => {
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
    this.forceSimulation.nodes(this.nodes).on("tick", this.tick);

    // 边渲染
    this.forceSimulation
      .force("link")
      .links(this.edges)
      .distance((d) => {
        return d.lineLength; // 边的长度
      });

    // 节点
    this.g
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("class", "graph-node")
      .attr("r", 20) // 节点大小
      .attr("fill", (d, i) => {
        return d.color;
      })
      .call(
        // 拖拽设置
        d3
          .drag()
          .on("start", this.started)
          .on("drag", this.dragged)
          .on("end", this.ended)
      )
      .on("click", (d, i) => {
        this.deleteNode(i);
      });

    //节点描述
    this.g
      .selectAll("nodeText")
      .data(this.nodes)
      .enter()
      .append("text")
      .attr("class", "node-des")
      .text((d, i) => {
        return d.name;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", 14) // 文字大小
      .attr("fill", (d, i) => {
        return "#242B45";
      });

    // 边
    this.g
      .selectAll("line")
      .data(this.edges)
      .enter()
      .append("path")
      .attr("class", "link-node")
      .attr("id", (d, i) => {
        return "edgepath" + i;
      })
      .attr("stroke", (d) => {
        return "#325764";
      });

    // 边的描述
    this.g
      .selectAll("edgeText")
      .data(this.edges)
      .enter()
      .append("text")
      .attr("class", "edge-des")
      .text((d, i) => {
        return "";
      })
      .attr("fill", (d, i) => {
        return "#242B45"; // 箭头字体颜色
      })
      .append("textPath")
      .attr("xlink:href", (d, i) => {
        return "#edgepath" + i;
      })
      .text((d, i) => {
        return d.name;
      });
  };

  /**
   * @description 渲染图形位置
   */
  tick = () => {
    // 圆点的位置
    this.g.selectAll("circle").attr("transform", (d, i) => {
      return `translate(${d.x},${d.y})`;
    });

    // 线位置
    this.g.selectAll(".link-node").attr("d", (d) => {
      if (d.radius) {
        return `M${d.target.x} ${d.target.y} A ${d.radius} ${d.radius
          }, 0,1,1, ${d.target.x + 2 * d.radius} ${d.target.y} A ${d.radius} ${d.radius
          }, 0,1,1, ${d.target.x} ${d.target.y}`;
      }

      let dr = 0; // Math.random()*1000
      if (d.shirft < 2) {
        const dx = d.target.x - d.source.x; //增量
        const dy = d.target.y - d.source.y;

        dr = d.shirft * Math.sqrt(dx * dx + dy * dy);
      }

      if (d.target.x > d.source.x) {
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          d.target.x +
          "," +
          d.target.y
        );
      } else {
        return (
          "M" +
          d.target.x +
          "," +
          d.target.y +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,0 " +
          d.source.x +
          "," +
          d.source.y
        );
      }
    });

    // 点上文字的位置
    this.g
      .selectAll(".node-des")
      .attr("x", (d) => {
        return d.x;
      })
      .attr("y", (d) => {
        return d.y - 30;
      });

    // 边文字的位置
    this.g
      .selectAll(".edge-des")
      .attr("x", (d) => {
        if (d.radius) {
          return d.target.x + 2 * d.radius - 30;
        }

        const dx = Math.abs(d.source.x - d.target.x);
        const dy = Math.abs(d.source.y - d.target.y);

        // return (d.source.x + d.target.x) /2;
        return Math.sqrt(dx * dx + dy * dy) / 2;
      })
      .attr("y", (d) => {
        if (d.radius) {
          if ((d.radius / 50) % 2 === 0) {
            return d.target.y + 50;
          }

          return d.target.y - 50;
        }

        // return (d.source.y + d.target.y) /2;

        return 0;
      })
      .attr("dominant-baseline", (d) => {
        if (d.source.x < d.target.x) {
          return "text-after-edge";
        }
        return "text-before-edge";
      });
  };

  render() {
    return (
      <div className="graph">
        <div className="button" onClick={this.addNode}>
          <span className="add">add</span>
        </div>
        <div className="button" onClick={this.addline}>
          <span className="add">addline</span>
        </div>
        <div className="button" onClick={this.deleteLine}>
          <span className="add">deleteline</span>
        </div>

        <div id="main"></div>
      </div>
    );
  }
}

export default D3Graph;
