import { Container, Graphics, Sprite } from 'pixi.js';
import { TweenMax } from "gsap/all";
import sound from 'pixi-sound';

import Paragraph from '../components/paragraph';

import { loader } from '../loader';

export default class SetsunaLineScene {
  constructor({ storyScene, width, finalHeight, callback, spriteTextures }) {
    this.rootContainer = new Container();
    this.storyScene = storyScene;
    this.width = width;
    this.finalHeight = finalHeight;
    this.padding = 20;
    this.callback = callback;
    this.spriteTextures = spriteTextures;

    this.currentPage = 0;
    this.currentParaIndex = 0;
    this.story = [
      {
        paragraph: [
          {
            content: '我随着武也、伊绪走出了酒馆。车站外人流攒动，到处洋溢着节日的欢快。',
            x: this.padding,
            y: 60
          },
          {
            content: '三年前的背叛。两年间的逃避。然后是一周前的谎言。脑海中挥之不去自己的罪过。',
            x: this.padding,
            y: 210
          },
          {
            content: '然后，我突然注意到：我们不知何时，已经走到了御宿艺术文化大厅的门前。',
            x: this.padding,
            y: 360
          },
          {
            content: '大批的人沿着大厅的楼梯走下。看来，音乐会好像刚刚结束。我望向手机的时钟，现在的时间是23时59分。',
            x: this.padding,
            y: 510
          },
          {
            content: '而正当我们在热闹的喧嚣中随波逐流的时候，',
            x: this.padding,
            y: 710
          },
          {
            content: '新的一年造访了！',
            x: this.padding,
            y: 810
          }
        ]
      },
      {
        paragraph: [
          {
            content: '呐，你还好吗?',
            x: this.padding,
            y: 250,
            bgm: 'touma1Bgm'
          },
          {
            content: '新年快乐。今年也多多关照啊！',
            x: this.padding,
            y: 430,
            bgm: 'touma2Bgm'
          },
          {
            content: '再见了，白色相簿的季节。',
            x: this.padding,
            y: 610
          },
        ]
      },
    ];

    this.storyContainer = [];

    this.initStoryContainer();
    this.render();
    this.bindEvent();
  }

  get container() {
    return this.rootContainer;
  }

  get wordWrapWidth() {
    return this.width - this.padding;
  }

  get isStoryEnd() {
    const { currentPage, story } = this;
    // console.log("currentPage", currentPage)

    if (currentPage === story.length - 1 && this.isCurrentPageEnd) {
      return true;
    }

    return false;

  }

  get isCurrentPageEnd() {
    const { currentPage, currentParaIndex, story } = this;

    // console.log('currentParaIndex', currentParaIndex);
    // console.log('story[currentPage].paragraph.length', story[currentPage].paragraph.length);

    if (currentParaIndex === story[currentPage].paragraph.length) {
      return true;
    }

    return false;
  }

  get isFirstPageEnd() {
    const { currentPage } = this;

    if (currentPage === 0 && this.isCurrentPageEnd) {
      return true;
    }

    return false;
  }

  initStoryContainer() {
    for (let i = 0; i < this.story.length; i++) {
      const temp = new Container();
      temp.visible = false;
      this.storyContainer.push(temp);
    }
  }

  renderParagrap() {
    const { currentPage, currentParaIndex, story, wordWrapWidth, storyContainer } = this;
    const paragraph = story[currentPage].paragraph[currentParaIndex];
    const container = storyContainer[currentPage];

    if (paragraph.bgm) {
      sound.play(paragraph.bgm, {
        volume: 2.8,
      });
    }

    const text = new Paragraph({
      content: paragraph.content,
      width: wordWrapWidth
    });
    text.container.x = paragraph.x;
    text.container.y = paragraph.y;
    text.container.alpha = 0;
    container.addChild(text.container);

    TweenMax.to(text.container, 0.5, { alpha: 1 });
  }

  bindEvent() {
    const { mask, storyContainer } = this;

    mask.interactive = true;

    mask.on('tap', () => {

      if (loader.resources['touma1Bgm'].sound.isPlaying || loader.resources['touma2Bgm'].sound.isPlaying) {
        return;
      }

      if (this.isFirstPageEnd) {
        this.showNewYear();
        return;
      }

      if (this.isStoryEnd) {
        // console.log('isStoryEnd');
        this.callback(this.container);
        return;
      }

      if (this.isCurrentPageEnd) {
        storyContainer[this.currentPage].visible = false;
        this.currentPage += 1;
        this.currentParaIndex = 0;
        storyContainer[this.currentPage].visible = true;
      }

      this.renderParagrap();

      this.currentParaIndex += 1;
    });

    // trigger触发一次tap
    mask.emit('tap');
  }

  showNewYear() {
    // console.log('showNewYear');
    TweenMax.to(this.mask, 0.5, {
      alpha: 0
    });

    TweenMax.to(this.newYear, 0.5, {
      alpha: 1
    });

    if (!loader.resources['newYearBgm'].sound.isPlaying) {
      // 背景音乐放小
      sound.volume('bgm', 0.5);

      sound.play('newYearBgm', {
        volume: 1.3,
        complete: () => {
          // console.log('Sound finished');
          // 还原背景音乐
          // sound.volume('bgm', 0.8);

          TweenMax.to(this.mask, 0.5, {
            alpha: 0.8
          });

          TweenMax.to(this.newYear, 0.5, {
            alpha: 0,
            complete: () => {
              this.newYear.visible = false;
              this.storyContainer[this.currentPage].visible = false;
              this.currentPage += 1;
              this.currentParaIndex = 0;
              this.storyContainer[this.currentPage].visible = true;
              setTimeout(() => this.mask.emit('tap'), 500);
            }
          });
        }
      });
    }
  }

  render() {
    const { container: setsunaLineContainer, width, finalHeight, wordWrapWidth, storyContainer, currentPage, spriteTextures } = this;
    setsunaLineContainer.alpha = 0;

    const mask = new Graphics();
    mask.beginFill(0x052338);
    mask.drawRect(0, 0, width, finalHeight - 200);
    mask.endFill();
    mask.y = 90;
    mask.alpha = 0.8;
    setsunaLineContainer.addChild(mask);
    this.mask = mask;

    const tipContainer = new Container();
    tipContainer.x = width - 110;
    tipContainer.y = finalHeight - 240;
    mask.addChild(tipContainer);

    const text = new Paragraph({
      content: 'TOUCH',
      width: wordWrapWidth,
      fontSize: 25
    });
    tipContainer.addChild(text.container);

    const snow = new Sprite(spriteTextures['snow.png']);
    snow.scale.set(0.6, 0.6);
    snow.position.set(30, -30);
    tipContainer.addChild(snow);
    this.snow = snow;

    const newYear = new Sprite(loader.resources['newYear'].texture);
    setsunaLineContainer.addChild(newYear);
    newYear.alpha = 0;
    newYear.y = (finalHeight - 450) / 2 - 20;
    this.newYear = newYear;

    storyContainer.forEach((item) => mask.addChild(item));

    storyContainer[currentPage].visible = true;


    this.initBeginAnima();
  }

  initBeginAnima() {
    const { storyScene, container, snow } = this;
    TweenMax.to(storyScene.container, 0.3, { alpha: 0, visible: false });
    TweenMax.to(container, 0.8, { alpha: 1 });
    TweenMax.fromTo(snow, 1, { alpha: 1 }, { alpha: 0, repeat: -1, yoyo: true, delay: 1.2 });
  }
}