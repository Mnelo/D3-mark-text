import React, { Component } from 'react';
import G6 from '@antv/g6';
import './style.less';

class TreeGraph extends Component {
  ref = React.createRef();

  componentDidMount() {
    this.init();
  }

  init = () => {
    const data = {
      id: '1',
      children: [
        {
          id: '2',
          children: [
            {
              id: '3'
            },
            {
              id: '4'
            },
            {
              id: '5'
            },
            {
              id: '6'
            },
            {
              id: '7'
            },
            {
              id: '8'
            },
            {
              id: '10'
            }
          ]
        }
      ]
    };

    const graph = new G6.TreeGraph({
      container: this.ref.current,
      width: this.ref.current.width,
      height: this.ref.current.height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas']
      },
      defaultNode: {
        size: 26,
        anchorPoints: [
          [0, 0.5],
          [1, 0.5]
        ]
      },
      defaultEdge: {
        type: 'cubic-horizontal'
      },
      layout: {
        type: 'dendrogram',
        direction: 'LR', // H / V / LR / RL / TB / BT
        nodeSep: 30,
        rankSep: 100
      }
    });

    graph.node(function (node) {
      return {
        label: node.id,
        labelCfg: {
          position: node.children && node.children.length > 0 ? 'left' : 'right',
          offset: 5
        }
      };
    });

    graph.edge(function (data) {
      return {
        label: data.id,
        type: 'cubic-horizontal',
        color: '#A3B1BF'
      };
    });

    graph.data(data);
    graph.render();
    graph.fitCenter();
  };

  render() {
    return <div className="tree-graph" ref={this.ref}></div>;
  }
}

export default TreeGraph;
