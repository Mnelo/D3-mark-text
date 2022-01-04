import React, { Component } from 'react';
import Tag from './tag';
import Graph from './graph';
import D3Graph from './D3Graph';
import G6Graph from './G6Graph';
import RectGraph from './rectGraph';
import TreeGraph from './treeGraph';
import './app.less';

class App extends Component {
  state = {
    select: ''
  };

  select = select => {
    this.setState({
      select
    });
  };

  render() {
    const { select } = this.state;

    return (
      <div className="App">
        <div className="top-button">
          <div
            className="button"
            onClick={() => {
              this.select('graph');
            }}
          >
            <span className="add">图形</span>
          </div>

          <div
            className="button"
            onClick={() => {
              this.select('tag');
            }}
          >
            <span className="add">文字</span>
          </div>

          <div
            className="button"
            onClick={() => {
              this.select('D3Graph');
            }}
          >
            <span className="add">D3Graph</span>
          </div>

          <div
            className="button"
            onClick={() => {
              this.select('G6Graph');
            }}
          >
            <span className="add">G6Graph</span>
          </div>

          <div
            className="button"
            onClick={() => {
              this.select('treeGraph');
            }}
          >
            <span className="add">treeGraph</span>
          </div>

          <div
            className="button"
            onClick={() => {
              this.select('rectGraph');
            }}
          >
            <span className="add">RectGraph</span>
          </div>
        </div>

        {select === 'graph' ? <Graph /> : null}
        {select === 'tag' ? <Tag /> : null}
        {select === 'D3Graph' ? <D3Graph /> : null}
        {select === 'G6Graph' ? <G6Graph /> : null}
        {select === 'rectGraph' ? <RectGraph /> : null}
        {select === 'treeGraph' ? <TreeGraph /> : null}
      </div>
    );
  }
}

export default App;
