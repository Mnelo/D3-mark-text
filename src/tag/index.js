import React, { Component } from "react";
import "./animate.less";
import "./style.less";

const word =
  "夏风把暮霭吹进房间，窗帘的薄纱轻盈地扬起再款款飘落。风扇不知疲倦地旋转着，发出“咔滋咔滋”的声音。整个房间像是有条不紊运行着的宇宙，每个物件保持着自己的节奏度过了好几个世纪，还要以同样的方式度过接下来的几个世纪。突然响起的吉他和弦声像是一颗颗陨石划破了太空，琤琮的声音如火花般在无垠的黑幕下闪现着耀眼的光芒把这座宇宙的平衡划出一道残缺的口。宁隅涵抱着吉他坐在书桌旁，琴弦散在琴头，摇摇晃晃地反射出夕阳的光斑。他把电脑前的话筒摆整齐，稚嫩的声音哼出一段旋律。唱罢后他放下吉他，用软件剪辑音频。空格键敲下，刚刚录下的声音从电脑旁的两个小音响里淌入房间。他眉头紧蹙地听完，呼出一口凝重的气，不甚满意摇";

class Tag extends Component {
  state = {
    line: [],
    tagTitle: [],
  };

  componentDidMount() {
    window.addEventListener("mouseup", this.mouseUp);
  }

  mouseUp = (e) => {
    setTimeout(() => {
      let text = window.getSelection();

      if (text.isCollapsed) {
        return;
      }

      let startWord = text.anchorNode.parentNode;
      let endWord = text.focusNode.parentNode;

      this.changeColor(startWord, endWord);

      this.addTage(startWord, endWord);
    }, 100);
  };

  // 改变框选的文字颜色
  changeColor = (startWord, endWord) => {
    let start = parseInt(startWord.getAttribute("index"));
    let end = parseInt(endWord.getAttribute("index"));

    if (start <= end) {
      end = end + 1;
    }

    if (start > end) {
      let temp = end;
      end = start + 1;
      start = temp;
    }

    const word = document.getElementsByClassName("word-for-tag");

    for (let i = start; i < end; i++) {
      word[i].style.background = "red";
    }
  };

  // 添加注释
  addTage = (startWord, endWord) => {
    if (!startWord.getAttribute("index") || !endWord.getAttribute("index")) {
      return;
    }

    let { tagTitle } = this.state;

    let wordKey = "";
    parseInt(startWord.getAttribute("index")) >=
    parseInt(endWord.getAttribute("index"))
      ? (wordKey = startWord)
      : (wordKey = endWord);

    const tag = {
      left: wordKey.offsetLeft - 20,
      top: wordKey.offsetTop - 25,
      content: "标注内容",
    };

    tagTitle = [...tagTitle, tag];

    this.setState({
      tagTitle,
    });
  };

  // 添加线
  addLine = () => {
    const tagInfo = document.getElementsByClassName("tag-info");
    let { line } = this.state;

    if (tagInfo.length < 2) {
      return;
    }

    let startTag = {
      dom: tagInfo[0],
      left: parseInt(tagInfo[0].style.left),
      top: parseInt(tagInfo[0].style.top) + 10,
    };

    let endTag = {
      dom: tagInfo[1],
      left: parseInt(tagInfo[1].style.left),
      top: parseInt(tagInfo[1].style.top) + 10,
    };

    let start = `${startTag.left},${startTag.top}`;
    let end = `${endTag.left},${endTag.top}`;
    let turnOne = `10,${startTag.top}`;
    let turnTwo = `10,${endTag.top}`;

    let path = `${start} ${turnOne} ${turnTwo} ${end}`;

    line = [...line, path];

    this.setState({
      line,
    });
  };

  // 删除线
  deleteLine = () => {
    this.setState({
      line: [],
    });
  };

  render() {
    const { line, tagTitle } = this.state;

    return (
      <div id="tag-main" className="tag">
        <div className="line">
          <p>
            {word &&
              word.split("").map((item, index) => {
                return (
                  <span className="word-for-tag" key={index} index={index}>
                    {item}
                  </span>
                );
              })}
          </p>
        </div>

        {/* 标注 */}
        <div className="tag-content">
          {tagTitle &&
            tagTitle.length > 0 &&
            tagTitle.map((item, index) => {
              return (
                <div
                  className="tag-info"
                  key={index.toString()}
                  style={{ left: item.left, top: item.top }}
                >
                  {item.content}
                </div>
              );
            })}
        </div>

        {/* 线 */}
        <svg id="svgLine" className="svg-line">
          {line &&
            line.length > 0 &&
            line.map((item, index) => {
              return <polyline key={index.toString()} points={item} />;
            })}
        </svg>

        <div className="button" onClick={this.addLine}>
          <span className="add">添加线</span>
        </div>

        <div className="button" onClick={this.deleteLine}>
          <span className="add">删除线</span>
        </div>

        <div className="test animate__animated animate__fadeInLeft"></div>0
      </div>
    );
  }
}

export default Tag;
