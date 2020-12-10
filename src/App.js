import React, { Component } from "react";
import Tag from "./tag";
import Graph from "./graph";
import "./app.less";

class App extends Component {
  state = {
    select: "",
  };

  select = (select) => {
    this.setState({
      select,
    });
  };

  render() {
    const { select } = this.state;

    return (
      <div className="App">
        <div
          className="button"
          onClick={() => {
            this.select("graph");
          }}
        >
          <span className="add">图形</span>
        </div>

        <div
          className="button"
          onClick={() => {
            this.select("tag");
          }}
        >
          <span className="add">文字</span>
        </div>

        {select === "graph" ? <Graph /> : null}
        {select === "tag" ? <Tag /> : null}
      </div>
    );
  }
}

export default App;
