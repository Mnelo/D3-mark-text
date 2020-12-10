import React, { Component } from "react";
import * as d3 from "d3";
import "./style.less";

class Graph extends Component {
  state = {
    nodes: [
      { x: 400, y: 480 },
      { x: 500, y: 540 },
      { x: 600, y: 640 },
      { x: 600, y: 740 },
    ],
    lines: [],
    texts: [
      {
        word:
          "1大苏打撒大撒大撒大打赏大撒大撒大撒大苏打撒大撒大撒大打赏大撒大撒大撒大苏打撒大撒",
        line: 0,
      },
      { word: "第二行内容：123456789", line: 1 },
      { word: "第3行内容：123456789", line: 2 },
      { word: "第4行内容：123456789", line: 3 },
    ],
    tags: [],
  };

  componentDidMount() {
    const { nodes, lines, texts, tags } = this.state;

    this.drwaNode(nodes, lines, texts, tags);

    window.addEventListener("mouseup", this.mouseUp);
  }

  componentDidUpdate(preProps, preStates) {
    if (preStates.lines !== this.state.lines) {
      const { nodes, lines, texts, tags } = this.state;

      d3.select("#svgGraph").remove();

      this.drwaNode(nodes, lines, texts, tags);
    }

    if (preStates.tags !== this.state.tags) {
      const { nodes, lines, texts, tags } = this.state;

      d3.select("#svgGraph").remove();

      this.drwaNode(nodes, lines, texts, tags);
    }
  }

  // 触发框选
  mouseUp = (e) => {
    setTimeout(() => {
      let selection = window.getSelection();
      let text = selection.toString(); // 框选文字

      if (selection.isCollapsed) {
        return;
      }

      if (
        selection.anchorNode.parentNode.getAttribute("text-line") ===
        selection.focusNode.parentNode.getAttribute("text-line")
      ) {
        this.lineSingle(selection, text);
      } else {
        this.lineMore(selection, text);
      }
    }, 100);
  };

  // 框选的文字没有换行
  lineSingle = (selection, text) => {
    let word = selection.focusNode.data; // 整个文章
    let lineIndex = selection.focusNode.parentNode.getAttribute("text-line");

    let tagWidth = 0; // 框选文字长度
    let beforeWord = 0; // 框选文字之前的文字的长度

    // 获取选中文字的宽度
    if (text) {
      tagWidth = this.getWordWidth(text);
    }

    // 获取选中文字之前文字的宽度，用于确定选中文字的起始点位置坐标
    if (text) {
      // 起始点下标
      const startNodeIndex = selection.anchorOffset;
      // 终点下标
      const endNodeIndex = selection.focusOffset;

      let beforeIndex = 0;

      if (startNodeIndex <= endNodeIndex) {
        beforeIndex = startNodeIndex;
      } else {
        beforeIndex = endNodeIndex;
      }

      if (!this.isAddTag(startNodeIndex, endNodeIndex, parseInt(lineIndex))) {
        return;
      }

      // 框选文字之前的文字
      const beforeSelected = word.substring(0, beforeIndex);

      beforeWord = this.getWordWidth(beforeSelected);
    }

    let { tags } = this.state;

    if (selection.anchorOffset <= selection.focusOffset) {
      tags = [
        ...tags,
        {
          beforeWord,
          tagWidth,
          lineIndex,
          startIndex: selection.anchorOffset,
          endIndex: selection.focusOffset,
        },
      ];
    } else {
      tags = [
        ...tags,
        {
          beforeWord,
          tagWidth,
          lineIndex,
          startIndex: selection.focusOffset,
          endIndex: selection.anchorOffset,
        },
      ];
    }

    this.setState({
      tags,
    });
  };

  // 框选的文字换行
  lineMore = (selection, text) => {
    let { tags } = this.state;

    // 按换行符将框选的文字分割
    let wordGroup = text.split("\n");

    let startLine = parseInt(
      selection.anchorNode.parentNode.getAttribute("text-line")
    );
    let endLine = parseInt(
      selection.focusNode.parentNode.getAttribute("text-line")
    );

    let startNodeIndex = 0; // 起始点在其行的下标
    let endNodeIndex = 0; // 终点在其行的下标

    if (startLine <= endLine) {
      // 正向框选
      startNodeIndex = selection.anchorOffset;
      endNodeIndex = selection.focusOffset;
    } else {
      // 逆向框选
      startNodeIndex = selection.focusOffset;
      endNodeIndex = selection.anchorOffset;
    }

    // 正向框选
    if (startLine <= endLine) {
      for (let i = startLine; i <= endLine; i++) {
        // 处理第一行
        if (i === startLine) {
          const { texts } = this.state;
          const word = texts[startLine].word;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(startNodeIndex, word.length - 1, startLine)) {
            return;
          }

          // 框选文字之前的文字
          const beforeSelected = word.substring(0, startNodeIndex);

          const beforeWord = this.getWordWidth(beforeSelected);

          const tagWidth = this.getWordWidth(wordGroup[0]);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: startLine,
              startIndex: startNodeIndex,
              endIndex: word.length - 1,
            },
          ];
        }

        // 处理最后一行
        if (i === endLine) {
          const beforeWord = 0;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(beforeWord, endNodeIndex - 1, endLine)) {
            return;
          }

          const tagWidth = this.getWordWidth(wordGroup[wordGroup.length - 1]);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: endLine,
              startIndex: beforeWord,
              endIndex: endNodeIndex - 1,
            },
          ];
        }

        // 处理中间被全选的行
        if (i < endLine && i > startLine) {
          const { texts } = this.state;
          const word = texts[i].word;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(0, word.length - 1, i)) {
            return;
          }

          const beforeWord = 0;
          const tagWidth = this.getWordWidth(word);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: i,
              startIndex: 0,
              endIndex: word.length - 1,
            },
          ];
        }
      }
    }

    // 逆向框选
    if (startLine > endLine) {
      for (let i = endLine; i <= startLine; i++) {
        // 处理第一行
        if (i === endLine) {
          const { texts } = this.state;
          const word = texts[endLine].word;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(startNodeIndex, word.length - 1, endLine)) {
            return;
          }

          // 框选文字之前的文字
          const beforeSelected = word.substring(0, startNodeIndex);

          const beforeWord = this.getWordWidth(beforeSelected);

          const tagWidth = this.getWordWidth(wordGroup[0]);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: endLine,
              startIndex: startNodeIndex,
              endIndex: word.length - 1,
            },
          ];
        }

        // 处理最后一行
        if (i === startLine) {
          const beforeWord = 0;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(beforeWord, endNodeIndex - 1, startLine)) {
            return;
          }

          const tagWidth = this.getWordWidth(wordGroup[wordGroup.length - 1]);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: startLine,
              startIndex: beforeWord,
              endIndex: endNodeIndex - 1,
            },
          ];
        }

        // 处理中间被全选的行
        if (i > endLine && i < startLine) {
          const { texts } = this.state;
          const word = texts[i].word;

          // 如果被框选过，则不再触发操作
          if (!this.isAddTag(0, word.length - 1, i)) {
            return;
          }

          const beforeWord = 0;
          const tagWidth = this.getWordWidth(word);

          tags = [
            ...tags,
            {
              beforeWord,
              tagWidth,
              lineIndex: i,
              startIndex: 0,
              endIndex: word.length - 1,
            },
          ];
        }
      }
    }

    this.setState({
      tags,
    });
  };

  // 是否添加框选（如果框选过的内容被框选过，则不进行框选）
  isAddTag = (start, end, lineIndex) => {
    const { tags } = this.state;
    const index = lineIndex;

    let startP = 0;
    let endP = 0;

    if (start < end) {
      startP = start;
      endP = end;
    } else {
      startP = end;
      endP = start;
    }

    for (let i = 0; i < tags.length; i++) {
      if (index === parseInt(tags[i].lineIndex)) {
        if (startP > tags[i].startIndex && startP < tags[i].endIndex) {
          return false;
        }

        if (endP > tags[i].startIndex && endP < tags[i].endIndex) {
          return false;
        }

        if (startP < tags[i].startIndex && endP > tags[i].endIndex) {
          return false;
        }

        if (startP > tags[i].startIndex && endP < tags[i].endIndex) {
          return false;
        }

        if (startP === tags[i].startIndex && endP === tags[i].endIndex) {
          return false;
        }
      }
    }

    return true;
  };

  // 获取文字的宽度
  getWordWidth = (word) => {
    const parent = document.getElementById("graph");
    let node = document.createElement("span");

    node.setAttribute("id", "compareWord");
    node.setAttribute("class", "compare");
    node.innerHTML = word;

    parent.appendChild(node);

    // 框选文字的宽度
    const beforeWord = node.offsetWidth;

    document.getElementById("compareWord").remove();

    return beforeWord;
  };

  drwaNode = (nodes, lines, texts, tags) => {
    let line = "";
    let addLine = "";

    const started = (event, d) => {
      addLine = {
        startX: event.subject.x,
        startY: event.subject.y,
      };

      line = svg
        .append("path")
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", 2);
    };

    const dragged = (event, d) => {
      const startX = event.subject.x;
      const startY = event.subject.y;

      const endX = Math.floor(event.x);
      const endY = Math.floor(event.y);

      const p = d3.path();

      p.moveTo(startX, startY);
      p.lineTo(endX, endY);

      line.attr("d", p.toString());
    };

    const ended = (event, d) => {
      let { lines } = this.state;

      if (event.sourceEvent.target.tagName === "circle") {
        addLine.endX = event.sourceEvent.target.getAttribute("cx");
        addLine.endY = event.sourceEvent.target.getAttribute("cy");

        lines = [...lines, addLine];

        this.setState({
          lines,
        });
      }

      line.remove();
    };

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("id", "svgGraph")
      .attr("width", 800)
      .attr("height", 800);

    svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .style("stroke", "gray")
      .style("fill", "black")
      .attr("r", 10)
      .attr("cx", (nodes) => {
        return nodes.x;
      })
      .attr("cy", (nodes) => {
        return nodes.y;
      })
      .call(
        d3.drag().on("start", started).on("drag", dragged).on("end", ended)
      );

    svg
      .selectAll("rect")
      .data(tags)
      .enter()
      .append("rect")
      .attr("x", (tag) => {
        return tag.beforeWord + 20;
      })
      .attr("y", (tag) => {
        return 65 + parseInt(tag.lineIndex) * 40;
      })
      .attr("width", (tag) => {
        return tag.tagWidth;
      })
      .attr("height", "20px")
      .attr("fill", "rgba(208,240,244,1");

    svg
      .selectAll("line")
      .data(lines)
      .enter()
      .append("path")
      .style("stroke", "gray")
      .style("fill", "none")
      .style("stroke-width", "1.75px")
      .attr("d", (line) => {
        return `M ${line.startX} ${line.startY} L ${line.endX} ${line.endY}`;
      });

    svg
      .selectAll("text")
      .data(texts)
      .enter()
      .append("text")
      .text((text) => {
        return text.word;
      })
      .attr("x", 20)
      .attr("y", (text) => {
        return 80 + text.line * 40;
      })
      .attr("text-line", (text) => {
        return text.line;
      })
      .style("font-size", "14px")
      .style("fill", "#000");
  };

  render() {
    return <div id="graph" className="graph-svg"></div>;
  }
}

export default Graph;
