import React, { Component } from 'react';
import G6 from '@antv/g6';
import './style.less';

class G6Graph extends Component {
  ref = React.createRef();
  graph = '';
  nodes = [];
  edges = [];
  nodeId = 0;
  edgeId = 0;

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.graph = new G6.Graph({
      container: this.ref.current,
      width: this.ref.current.width,
      height: this.ref.current.height,
      linkCenter: true,
      modes: {
        default: ['create-edge', 'drag-canvas', 'zoom-canvas', 'drag-node']
      },
      layout: {
        type: 'force',
        linkDistance: 300,
        nodeStrength: 0, //节点作用力，正数代表节点之间的引力作用，负数代表节点之间的斥力作用
        nodeSize: 40,
        preventOverlap: 40, // 防止节点间碰撞
        nodeSpacing: 50,
        // alpha: 1, //当前的迭代收敛阈值
        alphaDecay: 0.05, //迭代阈值的衰减率
        // alphaMin: 0.1, //停止迭代的阈值
        onTick: () => {}
        // gpuEnabled: true, // 是否启用GPU
      },
      defaultNode: {
        size: [40, 40],
        labelCfg: {
          position: 'top',
          style: {
            fill: '#fff'
          }
        }
      },
      defaultEdge: {
        size: 1,
        color: '#e2e2e2',
        labelCfg: {
          autoRotate: true,
          refY: 5,
          style: {
            fill: '#fff'
          }
        },
        style: {
          endArrow: {
            fill: '#eee',
            path: G6.Arrow.triangle(10, 12, 25),
            d: 25
          }
        }
      }
    });

    this.graph.data({ nodes: this.nodes, edges: this.edges });
    this.graph.render();

    this.graph.on('node:dragstart', e => {
      this.refreshDragedNodePosition(e);
    });

    this.graph.on('node:drag', e => {
      // this.graph.layout();
      this.refreshDragedNodePosition(e);
    });

    this.graph.on('node:dragend', e => {
      // e.item.get('model').fx = null;
      // e.item.get('model').fy = null;
    });

    this.graph.on('node:click', e => {
      console.log(e.item.get('model'));
    });

    this.graph.on('edge:click', e => {
      console.log(e.item.get('model'));
    });

    // 通过点击节点创建边
    this.graph.on('aftercreateedge', e => {
      const model = e.edge.get('model');

      // 指向自己
      if (model.source === model.target) {
        let dist = 100;

        this.edges.forEach((item, index) => {
          if (item.source === item.target && model.source === item.source) {
            dist += 50;
          }
        });

        this.graph.updateItem(e.edge, {
          label: '添加的自环',
          id: `edge${this.edgeId}`,
          type: 'loop',
          loopCfg: { position: 'top', dist },
          style: {
            endArrow: {
              fill: '#eee',
              path: G6.Arrow.triangle(10, 12, 0),
              d: 0
            }
          }
        });

        this.edgeId++;

        this.edges = [...this.edges, model];
      }

      if (model.source !== model.target) {
        let curveOffset = 0;

        this.edges.forEach((item, index) => {
          // 如果存在反向， 偏移量只加一次
          let opopsite = 0;

          // 如果两点之间存在多边
          if (model.source === item.source && model.target === item.target) {
            curveOffset += 40;
          }

          if (model.source === item.target && model.target === item.source && !item.curveOffset && !opopsite) {
            curveOffset += 40;

            opopsite = 1;
          }
        });

        if (curveOffset) {
          // 对添加的边进行配置
          this.graph.updateItem(e.edge, {
            type: 'quadratic',
            curveOffset,
            curvePosition: 0.5,
            label: '手动添加边(曲线)',
            id: `edge${this.edgeId}`
          });

          this.edgeId++;

          this.edges = [...this.edges, model];
        } else {
          // 对添加的边进行配置
          this.graph.updateItem(e.edge, {
            label: '手动添加边(直线)',
            id: `edge${this.edgeId}`
          });

          this.edgeId++;

          this.edges = [...this.edges, model];
        }
      }
    });
  };

  /**
   * @description 拖拽节点时进行定位
   */
  refreshDragedNodePosition = e => {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  };

  /**
   * @description 单个添加节点
   */
  addNode = () => {
    this.nodes = [
      ...this.nodes,
      { id: `${this.nodeId}`, x: 800 + Math.random() * 100, y: 300 + Math.random() * 100, label: 'addNode' }
    ];

    this.nodeId++;

    this.graph.changeData({ nodes: this.nodes, edges: this.edges });
  };

  /**
   * @description 批量导入
   */
  addMore = () => {
    // 导入的数据
    // let data = {
    //   nodes: [
    //     { label: 'p1' },
    //     { label: 'p2' },
    //     { label: 'p3' },
    //     { label: 'p4' },
    //     { label: 'p5' },
    //     { label: 'p6' },
    //     { label: 'p7' }
    //   ],
    //   edges: [
    //     {
    //       start: 'p1',
    //       end: 'p1',
    //       label: 'b1'
    //     },
    //     {
    //       start: 'p1',
    //       end: 'p1',
    //       label: 'b2'
    //     },
    //     {
    //       start: 'p1',
    //       end: 'p1',
    //       label: 'b3'
    //     },
    //     {
    //       start: 'p2',
    //       end: 'p3',
    //       label: 'b4'
    //     },
    //     {
    //       start: 'p2',
    //       end: 'p3',
    //       label: 'b5'
    //     },
    //     {
    //       start: 'p3',
    //       end: 'p2',
    //       label: 'b6'
    //     },
    //     {
    //       start: 'p3',
    //       end: 'p2',
    //       label: 'b7'
    //     },
    //     {
    //       start: 'p5',
    //       end: 'p6',
    //       label: 'b8'
    //     }
    //   ]
    // };

    let data = {
      nodes: [
        { label: 'p1' },
        { label: 'p2' },
        { label: 'p3' },
        { label: 'p4' },
        { label: 'p5' },
        { label: 'p6' },
        { label: 'p7' }
      ],
      edges: [
        {
          start: 'p1',
          end: 'p2',
          label: 'b1'
        },
        {
          start: 'p1',
          end: 'p3',
          label: 'b2'
        },
        {
          start: 'p1',
          end: 'p4',
          label: 'b3'
        },
        {
          start: 'p1',
          end: 'p5',
          label: 'b4'
        }
      ]
    };

    let temp = [];

    // for (let i = 0; i < 5000; i++) {
    //   temp = [...temp, { label: `test${i}` }];
    // }

    data.nodes = [...data.nodes, ...temp];

    this.handleAddMore(data);

    this.graph.changeData({ nodes: this.nodes, edges: this.edges });
  };

  /**
   * @description 批量导入数据处理
   */
  handleAddMore = data => {
    let { nodes, edges } = data;
    let newEdges = [];

    nodes = nodes.map((item, index) => {
      item.id = `${this.nodeId}`;
      item.x = 600 + Math.random() * 200;
      item.y = 100 + Math.random() * 200;

      this.nodeId++;

      return item;
    });

    edges.forEach((item, index) => {
      // 自环
      if (item.start === item.end) {
        let dist = 100;

        newEdges.forEach((nItem, nIndex) => {
          if (nItem.start === nItem.end && item.start === nItem.start) {
            dist += 50;
          }
        });

        newEdges = [
          ...newEdges,
          {
            start: item.start,
            end: item.end,
            source: this.findNodeId(nodes, item.start),
            target: this.findNodeId(nodes, item.end),
            label: '自环',
            id: `edge${this.edgeId}`,
            type: 'loop',
            loopCfg: { position: 'top', dist },
            style: {
              endArrow: {
                fill: '#eee',
                path: G6.Arrow.triangle(10, 12, 0),
                d: 0
              }
            }
          }
        ];

        this.edgeId++;
      }

      if (item.start !== item.end) {
        let curveOffset = 0;

        newEdges.forEach((nItem, nIndex) => {
          // 如果存在反向， 偏移量只加一次
          let opopsite = 0;

          // 如果两点之间存在多边
          if (item.start === nItem.start && item.end === nItem.end) {
            curveOffset += 40;
          }

          if (item.start === nItem.end && item.end === nItem.start && !nItem.curveOffset && !opopsite) {
            curveOffset += 40;

            opopsite = 1;
          }
        });

        if (curveOffset) {
          newEdges = [
            ...newEdges,
            {
              id: `edge${this.edgeId}`,
              start: item.start,
              end: item.end,
              source: this.findNodeId(nodes, item.start),
              target: this.findNodeId(nodes, item.end),
              label: '边连线',
              type: 'quadratic',
              curveOffset
            }
          ];
        } else {
          newEdges = [
            ...newEdges,
            {
              id: `edge${this.edgeId}`,
              start: item.start,
              end: item.end,
              source: this.findNodeId(nodes, item.start),
              target: this.findNodeId(nodes, item.end),
              label: '边连线'
            }
          ];
        }

        this.edgeId++;
      }
    });

    this.nodes = [...this.nodes, ...nodes];
    this.edges = [...this.edges, ...newEdges];
  };

  /**
   * @description 通过名称查找节点id
   */
  findNodeId = (nodes, label) => {
    for (let i = 0, { length } = nodes; i < length; i++) {
      if (nodes[i].label === label) {
        return nodes[i].id;
      }
    }
  };

  render() {
    return (
      <div className="G6" ref={this.ref}>
        <div className="op">
          <div className="addNode" onClick={this.addNode}>
            加点
          </div>

          <div className="addNode" onClick={this.addMore}>
            批量
          </div>
        </div>
      </div>
    );
  }
}

export default G6Graph;
